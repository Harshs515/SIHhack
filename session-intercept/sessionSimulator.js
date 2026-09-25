// sessionSimulator.js
// Run: node sessionSimulator.js

const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const { createSession } = require('./sessionRegistry')

require('dotenv').config({
  path: path.join(__dirname, '.env')
})

require('dotenv').config({
  path: path.join(__dirname, '..', 'backend', '.env')
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY
)

async function populateSessions() {
  console.log('[Simulator] Loading complaints...')

  const { data: complaints, error } = await supabase
    .from('complaints')
    .select(`
      complaint_id,
      crime_category,
      sub_category,
      state,
      district,
      city,
      latitude,
      longitude,
      amount,
      status
    `)
    .not('complaint_id', 'is', null)

  if (error) {
    console.error('[Simulator] Error:', error.message)
    return
  }

  if (!complaints || complaints.length === 0) {
    console.log('[Simulator] No complaints found.')
    return
  }

  console.log(
    `[Simulator] Found ${complaints.length} complaints.`
  )

  for (const c of complaints) {
    const latitude = Number(c.latitude)
    const longitude = Number(c.longitude)
    const amount = Number(c.amount)

    const sessionLatitude = Number.isFinite(latitude)
      ? latitude
      : 19.076

    const sessionLongitude = Number.isFinite(longitude)
      ? longitude
      : 72.877

    const fraudAmount = Number.isFinite(amount)
      ? amount
      : 0

    try {
      const session = createSession(
        c.complaint_id,
        sessionLatitude,
        sessionLongitude,
        fraudAmount
      )

      console.log(
        `[Simulator] Created session for ${c.complaint_id}`
      )

      console.log(
        `  Crime: ${c.crime_category || 'N/A'}`
      )

      console.log(
        `  Sub-category: ${c.sub_category || 'N/A'}`
      )

      console.log(
        `  Location: ${
          c.city ||
          c.district ||
          'Unknown'
        }, ${
          c.state ||
          'Unknown'
        }`
      )

      console.log(
        `  Coordinates: ${sessionLatitude}, ${sessionLongitude}`
      )

      console.log(
        `  Fraud amount: ₹${fraudAmount}`
      )

      console.log(
        `  DB status: ${c.status || 'N/A'}`
      )

      console.log(
        `  Session ID: ${session.session_id}`
      )

      console.log(
        `  Destination: ${session.destination_district}, ${session.destination_state}`
      )

      console.log(
        `  Last activity: ${session.last_activity_delta_minutes} min ago`
      )

      console.log(
        `  Session status: ${session.session_status}`
      )

      console.log('')

    } catch (err) {
      console.error(
        `[Simulator] Failed for complaint ${c.complaint_id}:`,
        err.message
      )
    }
  }

  console.log(
    `[Simulator] ${complaints.length} sessions populated.`
  )

  console.log(
    '[Simulator] Now start the resolver: npm start'
  )
}

populateSessions()