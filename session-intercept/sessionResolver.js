// sessionResolver.js
// Express microservice — simulates payment network's session API
// Runs on: http://localhost:8002
// Called by: backend/src/simulationEngine.js

const express = require('express')
const cors    = require('cors')
const { createSession, getSession, getAllSessions } = require('./sessionRegistry')
const app     = express()

app.use(cors())
app.use(express.json())

// POST /resolve
// Main endpoint — backend calls this with a transaction_id
// Returns session metadata including destination location
app.post('/resolve', (req, res) => {
  const { transaction_id, victim_lat, victim_lng, fraud_amount } = req.body

  if (!transaction_id) {
    return res.status(400).json({ error: 'transaction_id is required' })
  }

  // Check if session already exists
  let session = getSession(transaction_id)

  // If not, create one (this is what happens in real-time as complaint comes in)
  if (!session) {
    session = createSession(
      transaction_id,
      parseFloat(victim_lat) || 19.076,
      parseFloat(victim_lng) || 72.877,
      parseFloat(fraud_amount) || 10000
    )
    console.log(`[Resolver] Created new session for TXN: ${transaction_id}`)
  } else {
    console.log(`[Resolver] Found existing session for TXN: ${transaction_id}`)
  }

  // Check if session is still active
  const now = new Date()
  const expiresAt = new Date(session.session_expires_at)
  if (now > expiresAt) {
    session.session_status = 'EXPIRED'
  }

  console.log(`[Resolver] → ${session.destination_district}, ${session.destination_state} (${session.last_activity_delta_minutes} min ago)`)

  res.json({
    success: true,
    session,
    // Pre-computed features for ML (saves engine having to calculate)
    ml_features: {
      session_hop_count:            session.hop_count,
      session_age_minutes:          session.session_age_minutes,
      is_cross_state_session:       session.is_cross_state ? 1 : 0,
      last_activity_delta_minutes:  session.last_activity_delta_minutes,
      session_active:               session.session_status === 'ACTIVE' ? 1 : 0,
    }
  })
})

// GET /sessions
// Debug endpoint — see all active sessions
app.get('/sessions', (req, res) => {
  const all = getAllSessions()
  res.json({ count: all.length, sessions: all })
})

// GET /health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TRINETRA Session Resolver',
    sessions_loaded: getAllSessions().length
  })
})

const PORT = 8002
app.listen(PORT, () => {
  console.log(`[Resolver] TRINETRA Session Intercept Layer running on port ${PORT}`)
  console.log(`[Resolver] Health: http://localhost:${PORT}/health`)
  console.log(`[Resolver] Debug: http://localhost:${PORT}/sessions`)
})