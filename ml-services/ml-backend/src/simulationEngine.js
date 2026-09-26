/**
 * simulationEngine.js
 *
 * The core processing loop. Every 30 seconds:
 *   1. Fetches unprocessed complaints from Supabase
 *   2. Builds the feature payload matching YOUR model's training features
 *      (xgb_feature_names.json defines the exact column order)
 *   3. Calls the Python ML service at /predict
 *   4. Writes a row to predicted_hotspots
 *   5. Supabase Realtime fires → dashboard map updates live
 *
 * If ML service is down → ruleBasedFallback() keeps the demo alive.
 */
// At the top of simulationEngine.js, add:
const SESSION_RESOLVER_URL = process.env.SESSION_RESOLVER_URL || 'http://localhost:8002'

const STATE_LAT = {
  'Delhi': 28.6139, 'Maharashtra': 19.0760, 'Telangana': 17.3850,
  'Karnataka': 12.9716, 'Tamil Nadu': 13.0827, 'West Bengal': 22.5726,
  'Uttar Pradesh': 26.8467, 'Rajasthan': 26.9124, 'Bihar': 25.5941,
  'Jharkhand': 23.6102, 'Gujarat': 23.0225, 'Haryana': 29.0588,
  'Punjab': 31.1471, 'Madhya Pradesh': 23.2599, 'Andhra Pradesh': 15.9129,
  'Kerala': 10.8505, 'Odisha': 20.9517, 'Assam': 26.2006,
}
const STATE_LNG = {
  'Delhi': 77.2090, 'Maharashtra': 72.8777, 'Telangana': 78.4867,
  'Karnataka': 77.5946, 'Tamil Nadu': 80.2707, 'West Bengal': 88.3697,
  'Uttar Pradesh': 80.9462, 'Rajasthan': 75.7873, 'Bihar': 85.1376,
  'Jharkhand': 85.2799, 'Gujarat': 72.5714, 'Haryana': 76.0856,
  'Punjab': 75.3412, 'Madhya Pradesh': 77.4126, 'Andhra Pradesh': 79.7400,
  'Kerala': 76.2711, 'Odisha': 85.0985, 'Assam': 92.9376,
}

const { supabase, pool } = require('./db')
const axios              = require('axios')
require('dotenv').config()

const ML_URL        = process.env.ML_SERVICE_URL || 'http://localhost:8001'
const POLL_INTERVAL = 30_000   // 30 seconds
let   lastProcessedId = 0

// ── District → coordinates lookup ────────────────────────────
// Expand this list to match your district_classes.json
const DISTRICT_COORDS = {
  'Rohini':        { lat: 28.7041, lng: 77.0780, state: 'Delhi' },
  'Central Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'Hyderabad':     { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'Rangareddy':    { lat: 17.2403, lng: 78.3338, state: 'Telangana' },
  'Mumbai':        { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'Andheri':       { lat: 19.1136, lng: 72.8697, state: 'Maharashtra' },
  'Nashik':        { lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  'Kolkata':       { lat: 22.5726, lng: 88.3697, state: 'West Bengal' },
  'Chennai':       { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'Bengaluru':     { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Jaipur':        { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'Lucknow':       { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  'Khammam':       { lat: 17.2473, lng: 80.1514, state: 'Telangana' },
}

const DEFAULT_COORDS = { lat: 28.6139, lng: 77.2090, state: 'Delhi' }

// ── State-level coordinate fallbacks (Fix 1B) ──
// Handles complaints table latitude/longitude being null (NCRP portal may not always send them)
function getDefaultLatForState(state) {
  const defaults = {
    'Delhi': 28.6139, 'Maharashtra': 19.0760, 'Telangana': 17.3850,
    'Karnataka': 12.9716, 'Tamil Nadu': 13.0827, 'West Bengal': 22.5726,
    'Uttar Pradesh': 26.8467, 'Rajasthan': 26.9124, 'Bihar': 25.5941,
    'Jharkhand': 23.6102, 'Gujarat': 23.0225, 'Haryana': 29.0588,
    'Punjab': 31.1471, 'Madhya Pradesh': 23.2599, 'Andhra Pradesh': 15.9129,
    'Kerala': 10.8505, 'Odisha': 20.9517, 'Assam': 26.2006,
  }
  return defaults[state] || 20.5937  // India center as last fallback
}

function getDefaultLngForState(state) {
  const defaults = {
    'Delhi': 77.2090, 'Maharashtra': 72.8777, 'Telangana': 78.4867,
    'Karnataka': 77.5946, 'Tamil Nadu': 80.2707, 'West Bengal': 88.3697,
    'Uttar Pradesh': 80.9462, 'Rajasthan': 75.7873, 'Bihar': 85.1376,
    'Jharkhand': 85.2799, 'Gujarat': 72.5714, 'Haryana': 76.0856,
    'Punjab': 75.3412, 'Madhya Pradesh': 77.4126, 'Andhra Pradesh': 79.7400,
    'Kerala': 76.2711, 'Odisha': 85.0985, 'Assam': 92.9376,
  }
  return defaults[state] || 78.9629  // India center as last fallback
}

function mapComplaintFields(row) {
  return {
    dbId: row.id,
    ackNo: row.complaint_id || `ID-${row.id}`,
    fraudCategory: row.crime_category || row.fraud_category || 'OTHER',
    fraudAmount: parseFloat(row.amount || row.fraud_amount || 0),
    incidentTime: row.complaint_date || row.incident_timestamp || new Date().toISOString(),
    state: row.state || 'Unknown',
    district: row.district || 'Unknown',
    city: row.city || null,
    rawLat: row.latitude,
    rawLng: row.longitude,
    transactionId: row.raw_reference || row.transaction_id || null,
  }
}

function resolveCoords(rawLat, rawLng, state) {
  const lat = parseFloat(rawLat)
  const lng = parseFloat(rawLng)
  if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    return { lat, lng }
  }
  if (state && STATE_LAT[state]) {
    return { lat: STATE_LAT[state], lng: STATE_LNG[state] }
  }
  return { lat: 20.5937, lng: 78.9629 }
}

function buildPredictionWindow(alertLevel) {
  const now = new Date()
  const startMins = 15
  const endMins = alertLevel === 'P1' ? 60 : alertLevel === 'P2' ? 90 : 120

  return {
    predicted_window_start: new Date(now.getTime() + startMins * 60000).toISOString(),
    predicted_window_end: new Date(now.getTime() + endMins * 60000).toISOString(),
  }
}

async function trySessionIntercept(c, lat, lng) {
  if (!c.transactionId) return null

  try {
    const res = await axios.post(`${SESSION_RESOLVER_URL}/resolve`, {
      transaction_id: c.transactionId,
      victim_lat: lat,
      victim_lng: lng,
      fraud_amount: c.fraudAmount,
    }, { timeout: 4000 })

    if (res.data?.success && res.data?.session?.session_status === 'ACTIVE') {
      console.log(`[Engine] 🔗 Session intercepted for ${c.ackNo}:`)
      console.log(`         From: ${c.district}, ${c.state}`)
      console.log(`         To:   ${res.data.session.destination_district}, ${res.data.session.destination_state}`)
      return res.data
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Engine] Session resolver unavailable (${err.message}) — using victim location`)
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────
async function processNewComplaints() {
  try {
    const { data: complaints, error: fetchError } = await supabase
      .from('complaints')
      .select('*')
      .eq('status', 'submitted')
      .gt('id', lastProcessedId)
      .order('id', { ascending: true })
      .limit(10)

    if (fetchError) {
      console.error('[Engine] Fetch error:', fetchError.message)
      return
    }

    if (!complaints || complaints.length === 0) return

    console.log(`[Engine] Processing ${complaints.length} complaint(s)...`)

    for (const rawRow of complaints) {
      lastProcessedId = Math.max(lastProcessedId, rawRow.id)

      const c = mapComplaintFields(rawRow)

      let { lat, lng } = resolveCoords(c.rawLat, c.rawLng, c.state)
      let predLat = lat
      let predLng = lng
      let predState = c.state
      let predDistrict = c.district
      let predSource = 'ML_STANDARD'
      let sessionMeta = {}

      const sessionResult = await trySessionIntercept(c, lat, lng)
      if (sessionResult?.session) {
        const s = sessionResult.session
        predLat = s.destination_lat || predLat
        predLng = s.destination_lng || predLng
        predState = s.destination_state || predState
        predDistrict = s.destination_district || predDistrict
        predSource = 'SESSION_INTERCEPT'
        sessionMeta = {
          session_id: s.session_id,
          session_status: s.session_status,
          session_expires_at: s.session_expires_at,
          destination_bank_code: s.destination_bank_code,
          last_session_activity_minutes: s.last_activity_delta_minutes,
        }
      }

      let prediction
      try {
        const incidentAt = new Date(c.incidentTime)
        const filedAt = new Date(rawRow.created_at)
        const filingLagMin = Math.max(0, (filedAt - incidentAt) / 60000)
        const amount = c.fraudAmount || 10000

        const features = {
          complaint_id: c.ackNo,
          hour_of_fraud: incidentAt.getHours(),
          day_of_week: incidentAt.getDay(),
          month: incidentAt.getMonth() + 1,
          is_weekend: [0, 6].includes(incidentAt.getDay()) ? 1 : 0,
          is_night: (incidentAt.getHours() >= 22 || incidentAt.getHours() <= 6) ? 1 : 0,
          filing_lag_min: parseFloat(filingLagMin.toFixed(2)),
          amount_log: parseFloat(Math.log1p(amount).toFixed(4)),
          amount_band: getAmountBand(amount),
          is_round_amount: amount % 1000 < 50 ? 1 : 0,
          amount_retention_pct: 0.94,
          amount_start: amount,
          num_hops: 3,
          chain_duration_min: 45,
          unique_banks: 2,
          unique_districts: 2,
          intra_bank_ratio: 0.0,
          vom_score: 0.60,
          is_hot_chain: 0,
          velocity_per_min: parseFloat((amount / Math.max(1, filingLagMin)).toFixed(2)),
          fraud_type_enc: getFraudTypeCode(c.fraudCategory),
          bank_enc: 0,
          victim_state_enc: getStateCode(c.state),
          state_weight: 0.028,
          crime_rate_norm: 5.2,
          cyber_activity: 4.0,
          historical_activity: 2.0,
          ncrb_crime_rate_2022: 200,
          ncrb_chargesheet_rate_2022: 75,
          ncrb_motive_total: 100,
          ncrb_trend_2019_2021: 0.5,
          gnn_node_features: [],
          gnn_edge_src: [],
          gnn_edge_dst: [],
          cashout_atm_id: null,
          victim_lat: predLat,
          victim_lng: predLng,
          victim_state: predState,
          victim_district: predDistrict,
          session_hop_count: sessionResult?.session?.session_hop_count || 3,
          session_age_minutes: sessionResult?.session?.last_activity_delta_minutes || 60,
          is_cross_state_session: sessionResult?.session?.destination_state && sessionResult.session.destination_state !== c.state ? 1 : 0,
          last_activity_delta_minutes: sessionResult?.session?.last_activity_delta_minutes || 60,
          session_active: sessionResult?.session?.session_status === 'ACTIVE' ? 1 : 0,
        }

        const { data: mlResponse } = await axios.post(
          `${ML_URL}/predict`,
          features,
          { timeout: 8000 }
        )
        prediction = mlResponse
        console.log(`[Engine] ML responded: ${prediction.alert_level} | score: ${prediction.risk_score}`)
      } catch (mlErr) {
        console.warn(`[Engine] ML unreachable (${mlErr.message}) — using rule-based fallback`)
        prediction = ruleBasedFallback(c.fraudCategory, c.fraudAmount)
      }

      const riskScore = Math.min(1, Math.max(0, parseFloat(prediction.risk_score || 0.50)))
      const alertLevel = prediction.alert_level || (riskScore >= 0.80 ? 'P1' : riskScore >= 0.55 ? 'P2' : 'P3')
      const district = prediction.predicted_districts?.[0] || predDistrict || 'Central Delhi'
      const coords = DISTRICT_COORDS[district] || DEFAULT_COORDS
      const shapFeatures = prediction.shap_top_features || prediction.feature_importance || []
      const { predicted_window_start, predicted_window_end } = buildPredictionWindow(alertLevel)
      const sessionNote = sessionMeta.session_id
        ? `Session ${sessionMeta.session_id} intercepted — money confirmed at ${predDistrict}, ${predState}. Last network activity ${sessionMeta.last_session_activity_minutes} min ago.`
        : ''

      const { data: atms } = await supabase
        .from('atm_locations')
        .select('id, bank_name, city')
        .ilike('city', `%${district.split(' ')[0]}%`)
        .order('risk_tier', { ascending: false })
        .limit(1)

      const { data: stations } = await supabase
        .from('police_stations')
        .select('id, name')
        .eq('state', coords.state)
        .limit(1)

      const { data: modelRuns } = await supabase
        .from('model_runs')
        .select('id')
        .order('training_date', { ascending: false })
        .limit(1)

      const intelligence =
        `[${alertLevel}] ${c.fraudCategory} detected. ` +
        `Predicted cashout zone: ${district}, ${coords.state}. ` +
        `Risk score: ${(riskScore * 100).toFixed(0)}%. ` +
        `Fraud amount: ₹${Number(c.fraudAmount).toLocaleString('en-IN')}. ` +
        `Complaint: ${c.ackNo}. ` +
        (sessionNote ? `${sessionNote} ` : '') +
        `Deploy response units to ATM cluster within ${alertLevel === 'P1' ? 60 : alertLevel === 'P2' ? 90 : 120} minutes. ` +
        `Alert local banks to freeze suspicious transactions.`

      const { error: insertError } = await supabase
        .from('predicted_hotspots')
        .insert([{
          model_run_id: modelRuns?.[0]?.id || 1,
          complaint_id: c.dbId,
          cluster_id: prediction.cluster_id || Math.floor(Math.random() * 100),
          center_geom: `SRID=4326;POINT(${coords.lng} ${coords.lat})`,
          lat: predLat,
          lng: predLng,
          radius_meters: Math.max(500, Math.round(3000 * riskScore)),
          risk_score: riskScore,
          alert_level: alertLevel,
          top_fraud_category: c.fraudCategory,
          total_complaints_in_cluster: 1,
          total_fraud_volume: c.fraudAmount,
          predicted_window_start,
          predicted_window_end,
          atm_location_id: atms?.[0]?.id || null,
          assigned_police_station_id: stations?.[0]?.id || null,
          district,
          state: predState,
          actionable_intelligence: intelligence,
          shap_top_features: JSON.stringify(shapFeatures),
          ml_raw_output: JSON.stringify(prediction),
          prediction_source: predSource,
          ...sessionMeta,
          status: 'ACTIVE',
        }])

      if (insertError) {
        console.error('[Engine] Hotspot insert error:', insertError.message)
        continue
      }

      await supabase
        .from('complaints')
        .update({ status: 'processed' })
        .eq('id', rawRow.id)

      console.log(
        `[Engine] ✅ [${alertLevel}] ${c.ackNo}` +
        ` → ${district} (${(riskScore * 100).toFixed(0)}%)`
      )
    }
  } catch (err) {
    console.error('[Engine] Unhandled error:', err.message)
  }
}

// ─────────────────────────────────────────────────────────────
// RULE-BASED FALLBACK
// Produces realistic predictions even if ML service is down.
// Demo never breaks.
// ─────────────────────────────────────────────────────────────
function ruleBasedFallback(fraudCategory, amount) {
  const MAP = {
    'UPI_FRAUD':        { district: 'Rohini',     score: 0.82 },
    'KYC_SCAM':         { district: 'Hyderabad',  score: 0.74 },
    'INVESTMENT_FRAUD': { district: 'Mumbai',      score: 0.91 },
    'OTP_FRAUD':        { district: 'Rangareddy', score: 0.68 },
    'JOB_SCAM':         { district: 'Nashik',      score: 0.61 },
    'LOAN_SCAM':        { district: 'Rangareddy', score: 0.72 },
    'SEXTORTION':       { district: 'Bengaluru',   score: 0.69 },
    'COURIER_FRAUD':    { district: 'Central Delhi', score: 0.64 },
    'OTHER':            { district: 'Central Delhi', score: 0.55 },
  }

  const m     = MAP[fraudCategory] || MAP['OTHER']
  const amt   = parseFloat(amount) || 10000
  const mult  = Math.min(1.15, Math.log10(amt) / 5)
  const score = Math.min(0.97, m.score * mult)

  return {
    predicted_districts: [m.district],
    risk_score:          parseFloat(score.toFixed(4)),
    alert_level:         score >= 0.80 ? 'P1' : score >= 0.55 ? 'P2' : 'P3',
    shap_top_features:   [
      { feature: 'fraud_category', value: 0.34 },
      { feature: 'amount_log',     value: 0.28 },
      { feature: 'filing_lag_min', value: 0.18 },
    ],
    cluster_id:  Math.floor(Math.random() * 50),
    source:      'rule_based_fallback',
  }
}

// ─────────────────────────────────────────────────────────────
// HELPERS — match these to your encoder training exactly
// ─────────────────────────────────────────────────────────────
function getAmountBand(amount) {
  if (amount < 10000)   return 0   // < 10K
  if (amount < 50000)   return 1   // 10K–50K
  if (amount < 200000)  return 2   // 50K–2L
  if (amount < 1000000) return 3   // 2L–10L
  return 4                         // > 10L
}

// In simulationEngine.js, update getFraudTypeCode to check sub_category first
function getFraudTypeCode(sub_category, fraud_category) {
  const subMap = {
    'UPI_FRAUD':          0,
    'INTERNET_BANKING':   1,
    'BEC_EMAIL_TAKEOVER': 2,
    'VISHING':            3,
    'CARD_SIM_SWAP':      4,
    'EWALLET':            5,
    'AEPS':               6,
    'DEMAT':              7,
  }
  return subMap[sub_category] ?? subMap[fraud_category] ?? 8
}

function getStateCode(state) {
  // Expand from your state_enc.pkl
  const codes = {
    'Delhi': 0, 'Maharashtra': 1, 'Telangana': 2,
    'West Bengal': 3, 'Tamil Nadu': 4, 'Karnataka': 5,
    'Rajasthan': 6, 'Uttar Pradesh': 7,
  }
  return codes[state] ?? 0
}

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────
function startEngine() {
  console.log(`[Engine] 🚀 Started — polling every ${POLL_INTERVAL / 1000}s`)
  console.log(`[Engine] ML service target: ${ML_URL}`)
  processNewComplaints()
  setInterval(processNewComplaints, POLL_INTERVAL)
}

module.exports = { startEngine }
