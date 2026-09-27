const express = require('express')
const router  = express.Router()
const { pool, supabase } = require('../db')

// ─────────────────────────────────────────────────────────────
// POST /api/complaints
// Called by your NCRP React portal when user submits a complaint.
// Returns an acknowledgement number immediately.
// ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const {
    fraud_category,
    crime_category,
    fraud_amount,
    amount,
    incident_timestamp,
    complaint_date,
    state,
    district,
    city,
  } = req.body

  const category = fraud_category || crime_category
  const complaintAmount = fraud_amount ?? amount
  const incidentDate = incident_timestamp || complaint_date

  // ── Validate required fields ──────────────────────────────
  if (!category || complaintAmount == null || !incidentDate) {
    return res.status(400).json({
      success: false,
      error: 'crime_category, amount, and complaint_date are required',
    })
  }

  // ── Generate acknowledgement number: NCRP-YYYYMMDD-6DIGIT ─
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(100000 + Math.random() * 900000)
  const complaint_id = `NCRP-${date}-${rand}`

  try {
    const result = await pool.query(`
      INSERT INTO complaints (
        complaint_id, complaint_date, crime_category,
        state, district, city, amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted')
      RETURNING id, complaint_id, created_at
    `, [
      complaint_id, incidentDate, category,
      state || 'Unknown', district || 'Unknown', city || null,
      parseFloat(complaintAmount),
    ])

    const inserted = result.rows[0]
    console.log(`[Complaints] Filed: ${complaint_id} | ${category} | amount ${complaintAmount}`)

    return res.status(201).json({
      success:            true,
      acknowledgement_no: inserted.complaint_id,
      complaint_id:       inserted.complaint_id,
      id:                  inserted.id,
      filed_at:           inserted.created_at,
      message:            'Complaint registered. Predictive analysis will begin within 30 seconds.',
    })
  } catch (err) {
    console.error('[Complaints] Insert error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/complaints
// Dashboard complaints list with pagination
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const limit  = parseInt(req.query.limit)  || 50
  const offset = parseInt(req.query.offset) || 0
  const state  = req.query.state  || null
  const status = req.query.status || null

  try {
    let whereClause = 'WHERE 1=1'
    const params    = []
    let   idx       = 1

    if (state)  { whereClause += ` AND c.state = $${idx++}`;   params.push(state) }
    if (status) { whereClause += ` AND c.status = $${idx++}`;  params.push(status) }

    params.push(limit, offset)

    const result = await pool.query(`
      SELECT
        c.id,
        c.complaint_id,
        c.complaint_id AS acknowledgement_no,
        c.crime_category,
        c.crime_category AS fraud_category,
        c.amount,
        c.amount AS fraud_amount,
        c.state, c.district, c.city,
        c.status, c.created_at
      FROM complaints c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `, params)

    // Total count for pagination
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM complaints c ${whereClause}
    `, params.slice(0, -2))

    res.json({
      data:  result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    })
  } catch (err) {
    console.error('[Complaints] Fetch error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/complaints/:ack
// Track a complaint by acknowledgement number (NCRP status check)
// ─────────────────────────────────────────────────────────────
router.get('/:ack', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.complaint_id,
        c.complaint_id AS acknowledgement_no,
        c.crime_category,
        c.crime_category AS fraud_category,
        c.amount,
        c.amount AS fraud_amount,
        c.state, c.district, c.status, c.created_at,
        ph.alert_level, ph.risk_score, ph.actionable_intelligence,
        ph.predicted_window_start, ph.predicted_window_end
      FROM complaints c
      LEFT JOIN predicted_hotspots ph ON ph.complaint_id = c.id
      WHERE c.complaint_id = $1
      LIMIT 1
    `, [req.params.ack])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('[Complaints] Lookup error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
