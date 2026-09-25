// session-intercept/sessionSimulator.js
//
// Pre-populates in-memory sessions for complaints in the `complaints` table
// (NOT cybercrime_complaints — this codebase uses `complaints` as the canonical table)
//
// Field mapping from DB:
//   complaints.complaint_id    = acknowledgement number (text)
//   complaints.crime_category  = fraud category
//   complaints.amount          = fraud amount
//   complaints.complaint_date  = when complaint was filed
//   complaints.latitude        = victim lat (may be null — we handle that)
//   complaints.longitude       = victim lng (may be null — we handle that)
//   complaints.state           = victim state
//   complaints.district        = victim district
//   complaints.status          = 'submitted' (what NCRP portal sets)
//   complaints.raw_reference   = used as transaction_id if available
//
// Run: node sessionSimulator.js
// Then start resolver: npm start (runs sessionResolver.js on port 8002)

require('dotenv').config({ path: '../backend/.env' })
const { createClient } = require('@supabase/supabase-js')
const { createSession, getAllSessions } = require('./sessionRegistry')

// Validate env
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('[Simulator] ❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  console.error('[Simulator]    Copy backend/.env.example to backend/.env and fill it in')
  process.exit(1)
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service key — server side only
)

// State → default coordinates (used when complaints.latitude/longitude is null)
// This matches the getDefaultLatForState / getDefaultLngForState in simulationEngine.js
const STATE_COORDS = {
  'Delhi':           { lat: 28.6139, lng: 77.2090 },
  'Maharashtra':     { lat: 19.0760, lng: 72.8777 },
  'Telangana':       { lat: 17.3850, lng: 78.4867 },
  'Karnataka':       { lat: 12.9716, lng: 77.5946 },
  'Tamil Nadu':      { lat: 13.0827, lng: 80.2707 },
  'West Bengal':     { lat: 22.5726, lng: 88.3697 },
  'Uttar Pradesh':   { lat: 26.8467, lng: 80.9462 },
  'Rajasthan':       { lat: 26.9124, lng: 75.7873 },
  'Bihar':           { lat: 25.5941, lng: 85.1376 },
  'Jharkhand':       { lat: 23.6102, lng: 85.2799 },
  'Gujarat':         { lat: 23.0225, lng: 72.5714 },
  'Haryana':         { lat: 29.0588, lng: 76.0856 },
  'Punjab':          { lat: 31.1471, lng: 75.3412 },
  'Madhya Pradesh':  { lat: 23.2599, lng: 77.4126 },
  'Andhra Pradesh':  { lat: 15.9129, lng: 79.7400 },
  'Kerala':          { lat: 10.8505, lng: 76.2711 },
  'Odisha':          { lat: 20.9517, lng: 85.0985 },
  'Assam':           { lat: 26.2006, lng: 92.9376 },
  'Chhattisgarh':    { lat: 21.2787, lng: 81.8661 },
  'Uttarakhand':     { lat: 30.0668, lng: 79.0193 },
  'Himachal Pradesh':{ lat: 31.1048, lng: 77.1734 },
  'Goa':             { lat: 15.2993, lng: 74.1240 },
}

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 }

function getCoordsForComplaint(complaint) {
  // Prefer exact lat/lng from DB if present and valid
  const lat = parseFloat(complaint.latitude)
  const lng = parseFloat(complaint.longitude)
  if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    return { lat, lng }
  }
  // Fall back to state-level default
  const stateCoords = STATE_COORDS[complaint.state]
  if (stateCoords) return stateCoords
  // Last resort: India center
  return INDIA_CENTER
}

async function populateSessions() {
  console.log('\n[Simulator] TRINETRA Session Intercept — Populating sessions')
  console.log('[Simulator] Connecting to Supabase...')
  console.log(`[Simulator] Project: ${process.env.SUPABASE_URL?.slice(8, 36)}...`)
  console.log('')

  // Query the `complaints` table — NOT cybercrime_complaints
  // Select complaints that have been submitted and have either:
  //   - a raw_reference (used as transaction ID)
  //   - OR any complaint at all (we'll synthesize a transaction ID)
  const { data: complaints, error } = await supabase
    .from('complaints')               // ← correct table for this codebase
    .select(`
      id,
      complaint_id,
      complaint_date,
      crime_category,
      sub_category,
      amount,
      state,
      district,
      city,
      latitude,
      longitude,
      status,
      raw_reference,
      created_at
    `)
    .in('status', ['submitted', 'processed', 'OPEN'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[Simulator] ❌ Supabase query failed:')
    console.error(`             Code: ${error.code}`)
    console.error(`             Message: ${error.message}`)
    if (error.code === 'PGRST116') {
      console.error('[Simulator]    The `complaints` table may not exist or RLS is blocking access.')
      console.error('[Simulator]    Check that SUPABASE_SERVICE_KEY is the service role key, not anon key.')
    }
    return
  }

  if (!complaints || complaints.length === 0) {
    console.log('[Simulator] ⚠️  No complaints found in the `complaints` table.')
    console.log('[Simulator]    The NCRP portal inserts into this table when a complaint is filed.')
    console.log('')
    console.log('[Simulator]  To test:')
    console.log('   1. Go to https://sih-ncrp-ugc4.vercel.app')
    console.log('   2. File a complaint (any sub-category, fill all required fields)')
    console.log('   3. Come back and re-run: node sessionSimulator.js')
    console.log('')
    console.log('[Simulator] OR run this SQL in Supabase to check what is in the table:')
    console.log("   SELECT complaint_id, crime_category, amount, state, status FROM complaints ORDER BY created_at DESC LIMIT 5;")
    return
  }

  console.log(`[Simulator] ✅ Found ${complaints.length} complaint(s)\n`)

  let created = 0
  let skipped = 0

  for (const c of complaints) {
    // Build a transaction ID:
    // Use raw_reference from DB if available, otherwise synthesize from complaint_id
    const txnId = (c.raw_reference && c.raw_reference.trim())
      ? c.raw_reference.trim()
      : `TXN-${(c.complaint_id || String(c.id)).replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(-10)}`

    // Get coordinates (with fallback)
    const coords = getCoordsForComplaint(c)
    const amount = parseFloat(c.amount) || 10000

    // Create the session
    const session = createSession(txnId, coords.lat, coords.lng, amount)
    created++

    // Display summary
    const ackNo   = c.complaint_id || `ID-${c.id}`
    const cat     = c.crime_category || c.sub_category || 'Unknown'
    const origin  = [c.district, c.state].filter(Boolean).join(', ') || 'Unknown'
    const coordSrc = (c.latitude && c.longitude) ? 'exact' : 'state-default'

    console.log(`  ✅ ${ackNo}`)
    console.log(`     Category:    ${cat}`)
    console.log(`     Amount:      ₹${amount.toLocaleString('en-IN')}`)
    console.log(`     Status:      ${c.status}`)
    console.log(`     Origin:      ${origin} (coords: ${coordSrc})`)
    console.log(`     TXN ID:      ${txnId}`)
    console.log(`     Session ID:  ${session.session_id}`)
    console.log(`     → Destination: ${session.destination_district}, ${session.destination_state}`)
    console.log(`     → Bank:        ${session.destination_bank_name} [${session.destination_bank_code}]`)
    console.log(`     → Last Active: ${session.last_activity_delta_minutes} min ago (${session.last_activity_type})`)
    console.log(`     → Hops:        ${session.hop_count}`)
    console.log(`     → Expires:     ${new Date(session.session_expires_at).toLocaleString('en-IN')}`)
    console.log('')
  }

  const total = getAllSessions()
  console.log('─'.repeat(60))
  console.log(`[Simulator] Sessions created: ${created}`)
  console.log(`[Simulator] Sessions skipped: ${skipped}`)
  console.log(`[Simulator] Total in memory:  ${total.length}`)
  console.log('')
  console.log('[Simulator] ✅ Done. Now start the resolver:')
  console.log('   cd session-intercept && node sessionResolver.js')
  console.log('')
  console.log('[Simulator] Resolver endpoints:')
  console.log('   Health:  http://localhost:8002/health')
  console.log('   Resolve: POST http://localhost:8002/resolve  { transaction_id, victim_lat, victim_lng, fraud_amount }')
  console.log('   Debug:   GET  http://localhost:8002/sessions')
}

populateSessions().catch(err => {
  console.error('[Simulator] ❌ Unhandled error:', err.message)
  console.error(err.stack)
  process.exit(1)
})