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

// ─────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────
async function processNewComplaints() {
  try {

    // At the top of simulationEngine.js, add:
// const SESSION_RESOLVER_URL = process.env.SESSION_RESOLVER_URL || 'http://localhost:8002'

// Inside processNewComplaints(), BEFORE the ML call, add:

// ── Session Intercept Layer ──────────────────────────────
let sessionData = null
let predictionLat  = parseFloat(complaint.victim_lat) || 28.6139
let predictionLng  = parseFloat(complaint.victim_lng) || 77.2090
let predictionState    = complaint.state    || 'Delhi'
let predictionDistrict = complaint.district || 'Central Delhi'
let sessionFeatures    = {}

if (complaint.transaction_id) {
  try {
    const sessionRes = await axios.post(`${SESSION_RESOLVER_URL}/resolve`, {
      transaction_id: complaint.transaction_id,
      victim_lat:     complaint.victim_lat,
      victim_lng:     complaint.victim_lng,
      fraud_amount:   complaint.fraud_amount
    }, { timeout: 5000 })

    if (sessionRes.data.success && sessionRes.data.session.session_status === 'ACTIVE') {
      const s = sessionRes.data.session
      // Replace victim location with DESTINATION (mule) location
      predictionLat      = s.destination_lat
      predictionLng      = s.destination_lng
      predictionState    = s.destination_state
      predictionDistrict = s.destination_district
      sessionData        = s
      sessionFeatures    = sessionRes.data.ml_features || {}

      console.log(`[Engine] Session intercept → redirected prediction anchor:`)
      console.log(`  From: ${complaint.district}, ${complaint.state}`)
      console.log(`  To:   ${predictionDistrict}, ${predictionState}`)
      console.log(`  Session: ${s.session_id} | Last active: ${s.last_activity_delta_minutes}m ago`)
    }
  } catch (sessionErr) {
    // Session resolver unavailable — fall through to victim location
    console.warn(`[Engine] Session resolver unavailable: ${sessionErr.message} — using victim location`)
  }
}

// Now build features using predictionLat/Lng/State/District
// instead of complaint.victim_lat/lng/state/district
const features = {
  // ... all existing features ...
  victim_lat:      predictionLat,      // ← CHANGED: now mule location if session found
  victim_lng:      predictionLng,      // ← CHANGED
  victim_state:    predictionState,    // ← CHANGED
  victim_district: predictionDistrict, // ← CHANGED

  // New session features
  session_hop_count:           sessionFeatures.session_hop_count           || 3,
  session_age_minutes:         sessionFeatures.session_age_minutes          || 60,
  is_cross_state_session:      sessionFeatures.is_cross_state_session       || 0,
  last_activity_delta_minutes: sessionFeatures.last_activity_delta_minutes  || 60,
  session_active:              sessionFeatures.session_active               || 0,
}

// After inserting the hotspot, add session provenance to actionable intelligence:
const sessionNote = sessionData
  ? `Session ${sessionData.session_id} intercepted — money confirmed at ${predictionDistrict}, ${predictionState}. Last network activity ${sessionData.last_activity_delta_minutes} min ago. Session active for ${Math.floor((new Date(sessionData.session_expires_at) - new Date()) / 3600000)}h more.`
  : ''

const intelligence = `[${alertLevel}] ${complaint.fraud_category} flagged. ` +
  `Predicted cashout: ${predictionDistrict}, ${predictionState}. ` +
  `Risk: ${(riskScore * 100).toFixed(0)}%. ` +
  (sessionNote ? sessionNote + ' ' : '') +
  `Deploy units to ${atms?.[0]?.bank_name || ''} ATM cluster within ${windowMins} minutes.`
    // 1. Fetch complaints not yet processed
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

    for (const complaint of complaints) {
      lastProcessedId = Math.max(lastProcessedId, complaint.id)

      // ── 2. Build features for YOUR XGBoost model ──────────
      let prediction
      try {
        const incidentAt   = new Date(complaint.complaint_date)
        const filedAt      = new Date(complaint.created_at)
        const filingLagMin = Math.max(0, (filedAt - incidentAt) / 60000)
        const amount       = parseFloat(complaint.amount) || 10000

        // Feature names MUST match xgb_feature_names.json exactly.
        // If your feature names differ, update keys below to match.
        const features = {
          complaint_id:          complaint.complaint_id,
          hour_of_fraud:         incidentAt.getHours(),
          day_of_week:           incidentAt.getDay(),
          month:                 incidentAt.getMonth() + 1,
          is_weekend:            [0, 6].includes(incidentAt.getDay()) ? 1 : 0,
          is_night:              (incidentAt.getHours() >= 22 || incidentAt.getHours() <= 6) ? 1 : 0,
          filing_lag_min:        parseFloat(filingLagMin.toFixed(2)),
          amount_log:            parseFloat(Math.log1p(amount).toFixed(4)),
          amount_band:           getAmountBand(amount),
          is_round_amount:       amount % 1000 < 50 ? 1 : 0,
          amount_retention_pct:  0.94,
          amount_start:          amount,
          // Money mule chain features (defaults since we don't have full chain)
          num_hops:              3,
          chain_duration_min:    45,
          unique_banks:          2,
          unique_districts:      2,
          intra_bank_ratio:      0.0,
          vom_score:             0.60,
          is_hot_chain:          0,
          velocity_per_min:      parseFloat((amount / Math.max(1, filingLagMin)).toFixed(2)),
          // Category encoding
          fraud_type_enc:        getFraudTypeCode(complaint.crime_category),
          bank_enc:              0,   // unknown at filing time
          victim_state_enc:      getStateCode(complaint.state),
          // NCRB state-level risk priors (from your ncrb_state_priors_used.csv)
          state_weight:          0.028,
          crime_rate_norm:       5.2,
          cyber_activity:        4.0,
          historical_activity:   2.0,
          ncrb_crime_rate_2022:  200,
          ncrb_chargesheet_rate_2022: 75,
          ncrb_motive_total:     100,
          ncrb_trend_2019_2021:  0.5,
          // GNN features (empty for single complaint, GNN needs a graph)
          gnn_node_features:     [],
          gnn_edge_src:          [],
          gnn_edge_dst:          [],
          cashout_atm_id:        null,
          // Raw location for DBSCAN nearest-cluster lookup
          victim_lat:            parseFloat(complaint.lat) || 28.6139,
          victim_lng:            parseFloat(complaint.lng) || 77.2090,
          victim_state:          complaint.state || 'Delhi',
          victim_district:       complaint.district || 'Central Delhi',
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
        prediction = ruleBasedFallback(complaint)
      }

      // ── 3. Derive final alert fields ──────────────────────
      const riskScore  = Math.min(1, Math.max(0, parseFloat(prediction.risk_score || 0.50)))
      const alertLevel = prediction.alert_level ||
                         (riskScore >= 0.80 ? 'P1' : riskScore >= 0.55 ? 'P2' : 'P3')
      const district   = prediction.predicted_districts?.[0] || complaint.district || 'Central Delhi'
      const coords     = DISTRICT_COORDS[district] || DEFAULT_COORDS
      const windowMins = alertLevel === 'P1' ? 60 : alertLevel === 'P2' ? 90 : 120

      // SHAP features from ML response (your serve/ module should return these)
      const shapFeatures = prediction.shap_top_features || prediction.feature_importance || []

      // ── 4. Find nearest ATM in predicted district ─────────
      const { data: atms } = await supabase
        .from('atm_locations')
        .select('id, bank_name, city')
        .ilike('city', `%${district.split(' ')[0]}%`)
        .order('risk_tier', { ascending: false })
        .limit(1)

      // ── 5. Find nearest police station ────────────────────
      const { data: stations } = await supabase
        .from('police_stations')
        .select('id, name')
        .eq('state', coords.state)
        .limit(1)

      // ── 6. Get latest model run ID ────────────────────────
      const { data: modelRuns } = await supabase
        .from('model_runs')
        .select('id')
        .order('training_date', { ascending: false })
        .limit(1)

      // ── 7. Build actionable intelligence text ─────────────
      const intelligence =
        `[${alertLevel}] ${complaint.crime_category} detected. ` +
        `Predicted cashout zone: ${district}, ${coords.state}. ` +
        `Risk score: ${(riskScore * 100).toFixed(0)}%. ` +
        `Fraud amount: ${Number(complaint.amount).toLocaleString('en-IN')}. ` +
        `Complaint: ${complaint.complaint_id}. ` +
        `Deploy response units to ATM cluster within ${windowMins} minutes. ` +
        `Alert local banks to freeze suspicious transactions.`

      // ── 8. Insert predicted hotspot ───────────────────────
      const now     = new Date()
      const winEnd  = new Date(now.getTime() + windowMins * 60000)
      const winStart = new Date(now.getTime() + 15 * 60000)

      const { error: insertError } = await supabase
        .from('predicted_hotspots')
        .insert([{
          model_run_id:                modelRuns?.[0]?.id || 1,
          complaint_id:                complaint.id,
          cluster_id:                  prediction.cluster_id || Math.floor(Math.random() * 100),
          center_geom:                 `SRID=4326;POINT(${coords.lng} ${coords.lat})`,
          lat:                         coords.lat,
          lng:                         coords.lng,
          radius_meters:               Math.max(500, Math.round(3000 * riskScore)),
          risk_score:                  riskScore,
          alert_level:                 alertLevel,
          top_fraud_category:          complaint.crime_category,
          total_complaints_in_cluster: 1,
          total_fraud_volume:          parseFloat(complaint.amount),
          predicted_window_start:      winStart.toISOString(),
          predicted_window_end:        winEnd.toISOString(),
          atm_location_id:             atms?.[0]?.id || null,
          assigned_police_station_id:  stations?.[0]?.id || null,
          district:                    district,
          state:                       coords.state,
          actionable_intelligence:     intelligence,
          shap_top_features:           JSON.stringify(shapFeatures),
          ml_raw_output:               JSON.stringify(prediction),
          status:                      'ACTIVE',
        }])

      if (insertError) {
        console.error('[Engine] Hotspot insert error:', insertError.message)
        continue
      }

      // ── 9. Mark complaint as processed ────────────────────
      await supabase
        .from('complaints')
        .update({ status: 'processed' })
        .eq('id', complaint.id)

      console.log(
        `[Engine] ✅ [${alertLevel}] ${complaint.complaint_id}` +
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
function ruleBasedFallback(complaint) {
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

  const m     = MAP[complaint.crime_category] || MAP['OTHER']
  const amt   = parseFloat(complaint.amount) || 10000
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
