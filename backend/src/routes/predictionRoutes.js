const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/predictions/hotspots - Fetch active hotspots with Police Station dispatch & Model Run info
router.get('/hotspots', async (req, res) => {
  try {
    const query = `
      SELECT 
        h.id, h.model_run_id, h.cluster_id, 
        ST_Y(h.center_geom::geometry) AS center_latitude, 
        ST_X(h.center_geom::geometry) AS center_longitude, 
        h.radius_meters, h.risk_score, h.total_complaints_in_cluster, h.total_fraud_volume,
        h.predicted_window_start, h.predicted_window_end, h.actionable_intelligence, h.status,
        h.created_at, h.updated_at,
        ST_AsGeoJSON(h.center_geom::geometry)::json AS geometry,
        a.atm_id, a.bank_name, a.address AS atm_address, a.risk_tier AS atm_risk_tier,
        ps.station_name AS police_station_name, ps.jurisdiction_code, ps.contact_number AS police_contact,
        m.model_version, m.algorithm, m.accuracy AS model_accuracy
      FROM predicted_hotspots h
      LEFT JOIN atm_locations a ON h.atm_location_id = a.id
      LEFT JOIN police_stations ps ON h.assigned_police_station_id = ps.id
      LEFT JOIN model_runs m ON h.model_run_id = m.id
      WHERE h.status = 'ACTIVE'
      ORDER BY h.risk_score DESC;
    `;
    const result = await db.query(query);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error('Error fetching prediction hotspots:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/predictions/atms - Fetch all candidate ATMs
router.get('/atms', async (req, res) => {
  try {
    const query = `
      SELECT id, atm_id, bank_name, address, city, state, 
             ST_Y(geom::geometry) AS latitude, 
             ST_X(geom::geometry) AS longitude, 
             risk_tier, created_at, updated_at,
             ST_AsGeoJSON(geom::geometry)::json AS geometry
      FROM atm_locations;
    `;
    const result = await db.query(query);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error('Error fetching ATMs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/predictions/police-stations - Fetch all Police Stations
router.get('/police-stations', async (req, res) => {
  try {
    const query = `
      SELECT id, station_name, jurisdiction_code, contact_number, city, state, 
             ST_Y(geom::geometry) AS latitude, 
             ST_X(geom::geometry) AS longitude, created_at, updated_at,
             ST_AsGeoJSON(geom::geometry)::json AS geometry
      FROM police_stations;
    `;
    const result = await db.query(query);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error('Error fetching police stations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/predictions/model-runs - Fetch model run history
router.get('/model-runs', async (req, res) => {
  try {
    const query = `
      SELECT id, model_version, algorithm, training_date, accuracy, precision, recall, f1_score, created_at
      FROM model_runs
      ORDER BY id DESC LIMIT 10;
    `;
    const result = await db.query(query);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error('Error fetching model runs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/predictions/trigger - Manually trigger ML analytics pipeline
router.post('/trigger', async (req, res) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${mlUrl}/api/ml/process-pipeline`, { method: 'POST' });
    const data = await response.json();
    res.json({ success: true, ml_response: data });
  } catch (error) {
    console.error('Error triggering ML pipeline:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
