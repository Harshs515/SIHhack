// session-intercept/sessionSimulator.js
// Run: node sessionSimulator.js
// Pre-populates sessions for complaints in cybercrime_complaints 
// that have a transaction_id and status = 'UNDER_INVESTIGATION'

require('dotenv').config({ path: './.env' })
const { createClient } = require('@supabase/supabase-js')
const { createSession, getAllSessions } = require('./sessionRegistry')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function populateSessions() {
  console.log('[Simulator] Connecting to Supabase...')
  console.log(`[Simulator] URL: ${process.env.SUPABASE_URL?.slice(0,40)}...`)

  // Query cybercrime_complaints — the correct table
  // Use victim_lat/victim_lng flat columns (synced from geom via trigger)
  // Fall back to 19.076/72.877 (Mumbai default) if null
  const { data: complaints, error } = await supabase
    .from('cybercrime_complaints')
    .select(`
      id,
      acknowledgement_no,
      transaction_id,
      fraud_category,
      fraud_amount,
      amount_lost,
      victim_lat,
      victim_lng,
      state,
      district,
      status,
      created_at,
      incident_timestamp
    `)
    .not('transaction_id', 'is', null)
    .neq('transaction_id', '')
    .in('status', ['UNDER_INVESTIGATION', 'PROCESSED'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[Simulator] Supabase error:', error.message)
    console.error('[Simulator] Code:', error.code)
    return
  }

  if (!complaints || complaints.length === 0) {
    console.log('[Simulator] No complaints with transaction IDs found.')
    console.log('[Simulator] Instructions:')
    console.log('  1. Go to NCRP portal: https://sih-ncrp-ugc4.vercel.app')
    console.log('  2. File a complaint')
    console.log('  3. In the Transaction ID field, enter any value like: TXN123456')
    console.log('  4. Submit, then re-run this script')
    return
  }

  console.log(`[Simulator] Found ${complaints.length} complaint(s) with transaction IDs\n`)

  for (const c of complaints) {
    // Use flat lat/lng columns from DB
    // These are populated by the trg_sync_coords trigger from geom column
    const lat = parseFloat(c.victim_lat) || 19.0760  // Mumbai default
    const lng = parseFloat(c.victim_lng) || 72.8777

    // Use fraud_amount or amount_lost, whichever is present
    const amount = parseFloat(c.fraud_amount || c.amount_lost || 10000)

    const session = createSession(c.transaction_id, lat, lng, amount)

    console.log(`✅ ${c.acknowledgement_no}`)
    console.log(`   TXN ID:       ${c.transaction_id}`)
    console.log(`   Session ID:   ${session.session_id}`)
    console.log(`   Fraud Cat:    ${c.fraud_category}`)
    console.log(`   Amount:       ₹${amount.toLocaleString('en-IN')}`)
    console.log(`   Origin:       ${c.district || 'Unknown'}, ${c.state || 'Unknown'}`)
    console.log(`   → Destination: ${session.destination_district}, ${session.destination_state}`)
    console.log(`   → Dest Coords: ${session.destination_lat.toFixed(4)}, ${session.destination_lng.toFixed(4)}`)
    console.log(`   → Bank:        ${session.destination_bank_name} (${session.destination_bank_code})`)
    console.log(`   → Last Active: ${session.last_activity_delta_minutes} min ago`)
    console.log(`   → Activity:    ${session.last_activity_type}`)
    console.log(`   → Hops:        ${session.hop_count}`)
    console.log(`   → Status:      ${session.session_status}`)
    console.log(`   → Expires:     ${new Date(session.session_expires_at).toLocaleString('en-IN')}`)
    console.log('')
  }

  const all = getAllSessions()
  console.log(`[Simulator] ✅ ${all.length} sessions loaded into memory`)
  console.log('[Simulator] Now start the resolver: npm start')
  console.log('[Simulator] Resolver endpoint: http://localhost:8002/resolve')
  console.log('[Simulator] Debug view: http://localhost:8002/sessions')
}

populateSessions().catch(err => {
  console.error('[Simulator] Unhandled error:', err.message)
  process.exit(1)
})