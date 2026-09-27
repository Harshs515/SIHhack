const express = require('express')
const router  = express.Router()
const { pool } = require('../db')

// ─────────────────────────────────────────────────────────────
// GET /api/predictions/hotspots
// Active hotspots with ATM + police station info joined.
// This is what your GisHeatmapPage and CommandCenter read.
// ─────────────────────────────────────────────────────────────
router.get('/hotspots', async (req, res) => {
  const alert_level = req.query.level || null   // 'P1', 'P2', 'P3'
  const state       = req.query.state || null
  const limit       = parseInt(req.query.limit) || 100

  try {
    let where  = `WHERE ph.status = 'ACTIVE' AND ph.predicted_window_end > NOW()`
    const params = []
    let idx = 1

    if (alert_level) { where += ` AND ph.alert_level = $${idx++}`; params.push(alert_level) }
    if (state)        { where += ` AND ph.state = $${idx++}`;       params.push(state) }

    params.push(limit)

    const result = await pool.query(`
      SELECT
        ph.id,
        ph.lat,
        ph.lng,
        ph.radius_meters,
        ph.risk_score,
        ph.alert_level,
        ph.top_fraud_category,
        ph.total_complaints_in_cluster,
        ph.total_fraud_volume,
        ph.district,
        ph.state,
        ph.actionable_intelligence,
        ph.shap_top_features,
        ph.predicted_window_start,
        ph.predicted_window_end,
        ph.status,
        ph.created_at,
        -- ATM info
        atm.bank_name       AS atm_bank,
        atm.city            AS atm_city,
        atm.risk_tier       AS atm_risk_tier,
        ST_Y(atm.geom::geometry) AS atm_lat,
        ST_X(atm.geom::geometry) AS atm_lng,
        -- Police station info
        ps.name             AS station_name,
        ps.station_code,
        ps.contact_number   AS station_contact,
        ST_Y(ps.geom::geometry) AS station_lat,
        ST_X(ps.geom::geometry) AS station_lng
      FROM predicted_hotspots ph
      LEFT JOIN atm_locations  atm ON atm.id = ph.atm_location_id
      LEFT JOIN police_stations ps  ON ps.id  = ph.assigned_police_station_id
      ${where}
      ORDER BY ph.risk_score DESC
      LIMIT $${idx}
    `, params)

    res.json({ data: result.rows, count: result.rows.length })
  } catch (err) {
    console.error('[Predictions] Hotspots error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/predictions/stats
// Summary numbers for dashboard header cards
// ─────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [alertStats, complaintStats] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE alert_level = 'P1' AND status = 'ACTIVE') AS p1_active,
          COUNT(*) FILTER (WHERE alert_level = 'P2' AND status = 'ACTIVE') AS p2_active,
          COUNT(*) FILTER (WHERE alert_level = 'P3' AND status = 'ACTIVE') AS p3_active,
          COUNT(*) FILTER (WHERE status = 'ACTIVE')                         AS total_active,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')  AS last_24h,
          COALESCE(AVG(risk_score) FILTER (WHERE status = 'ACTIVE'), 0)     AS avg_risk
        FROM predicted_hotspots
      `),
      pool.query(`
        SELECT
          COUNT(*)                                                          AS total_complaints,
          COUNT(*) FILTER (WHERE status = 'submitted')                    AS pending,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS today,
          COALESCE(SUM(amount), 0)                                         AS total_fraud_volume
        FROM complaints
      `),
    ])

    const a = alertStats.rows[0]
    const c = complaintStats.rows[0]

    res.json({
      alerts: {
        p1_active:    parseInt(a.p1_active),
        p2_active:    parseInt(a.p2_active),
        p3_active:    parseInt(a.p3_active),
        total_active: parseInt(a.total_active),
        last_24h:     parseInt(a.last_24h),
        avg_risk:     parseFloat(a.avg_risk).toFixed(2),
      },
      complaints: {
        total:              parseInt(c.total_complaints),
        pending:            parseInt(c.pending),
        today:              parseInt(c.today),
        total_fraud_volume: parseFloat(c.total_fraud_volume),
      },
    })
  } catch (err) {
    console.error('[Predictions] Stats error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/predictions/atms
// All ATM locations for the map layer
// ─────────────────────────────────────────────────────────────
router.get('/atms', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, atm_id, bank_name, city, district, state, risk_tier,
             ST_Y(geom::geometry) AS lat,
             ST_X(geom::geometry) AS lng
      FROM atm_locations
      ORDER BY risk_tier DESC, state
    `)
    res.json({ data: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/predictions/police-stations
// All police stations for the map layer
// ─────────────────────────────────────────────────────────────
router.get('/police-stations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, station_code, city, district, state,
             jurisdiction, contact_number,
             ST_Y(geom::geometry) AS lat,
             ST_X(geom::geometry) AS lng
      FROM police_stations
      ORDER BY state, city
    `)
    res.json({ data: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/predictions/model-runs
// ML model versioning history — for the analytics page
// ─────────────────────────────────────────────────────────────
router.get('/model-runs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM model_runs
      ORDER BY training_date DESC
      LIMIT 10
    `)
    res.json({ data: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// PATCH /api/predictions/:id/acknowledge
// Field officer or LEA marks a hotspot as acknowledged
// ─────────────────────────────────────────────────────────────
router.patch('/:id/acknowledge', async (req, res) => {
  const { officer_name } = req.body
  try {
    await pool.query(`
      UPDATE predicted_hotspots
      SET status = 'ACKNOWLEDGED',
          acknowledged_by = $1,
          acknowledged_at = NOW()
      WHERE id = $2
    `, [officer_name || 'Unknown Officer', req.params.id])

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────
// PATCH /api/predictions/:id/resolve
// ─────────────────────────────────────────────────────────────
router.patch('/:id/resolve', async (req, res) => {
  try {
    await pool.query(`
      UPDATE predicted_hotspots SET status = 'RESOLVED' WHERE id = $1
    `, [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
