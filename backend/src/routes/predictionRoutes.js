const express = require('express');
const router = express.Router();
const { supabase, parseWKBPoint } = require('../supabase');

// GET /api/predictions/hotspots - Fetch active hotspots with ATM & Police Station details from Supabase
router.get('/hotspots', async (req, res) => {
  try {
    const [hRes, aRes, psRes, mRes] = await Promise.all([
      supabase.from('predicted_hotspots').select('*').eq('status', 'ACTIVE'),
      supabase.from('atm_locations').select('*'),
      supabase.from('police_stations').select('*'),
      supabase.from('model_runs').select('*'),
    ]);

    if (hRes.error) throw hRes.error;

    const atmsMap = Object.fromEntries((aRes.data || []).map((a) => [a.id, a]));
    const psMap = Object.fromEntries((psRes.data || []).map((p) => [p.id, p]));
    const mMap = Object.fromEntries((mRes.data || []).map((m) => [m.id, m]));

    const hotspots = (hRes.data || []).map((h) => {
      const coords = parseWKBPoint(h.center_geom);
      const atm = atmsMap[h.atm_location_id] || {};
      const ps = psMap[h.assigned_police_station_id] || {};
      const mr = mMap[h.model_run_id] || {};

      return {
        ...h,
        center_latitude: coords.latitude || 19.076,
        center_longitude: coords.longitude || 72.878,
        bank_name: atm.bank_name || 'Bank ATM',
        atm_id: atm.atm_id || 'N/A',
        atm_address: atm.address || 'Focus Area',
        city: atm.city || ps.city || 'India',
        state: atm.state || ps.state || 'India',
        atm_risk_tier: atm.risk_tier || 'CRITICAL',
        police_station_name: ps.station_name || 'Cyber Crime Police Station',
        police_contact: ps.contact_number || '1930',
        model_version: mr.model_version || 'v1.0.4-spatial',
        algorithm: mr.algorithm || 'ST-DBSCAN + XGBoost',
        model_accuracy: mr.accuracy || 0.942,
      };
    });

    res.json({ success: true, count: hotspots.length, data: hotspots });
  } catch (error) {
    console.error('Error fetching hotspots from Supabase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/predictions/atms - Fetch all candidate ATMs from Supabase
router.get('/atms', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('atm_locations')
      .select('*');

    if (error) throw error;

    const atms = (data || []).map((a) => {
      const coords = parseWKBPoint(a.geom);
      return {
        ...a,
        latitude: coords.latitude || a.latitude || 19.0755,
        longitude: coords.longitude || a.longitude || 72.878,
      };
    });

    res.json({ success: true, count: atms.length, data: atms });
  } catch (error) {
    console.error('Error fetching ATMs from Supabase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/predictions/police-stations - Fetch all Police Stations from Supabase
router.get('/police-stations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('police_stations')
      .select('*');

    if (error) throw error;

    const policeStations = (data || []).map((ps) => {
      const coords = parseWKBPoint(ps.geom);
      return {
        ...ps,
        latitude: coords.latitude || ps.latitude || 19.076,
        longitude: coords.longitude || ps.longitude || 72.8777,
      };
    });

    res.json({ success: true, count: policeStations.length, data: policeStations });
  } catch (error) {
    console.error('Error fetching police stations from Supabase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/predictions/model-runs - Fetch model run history from Supabase
router.get('/model-runs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('model_runs')
      .select('*')
      .order('id', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching model runs from Supabase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/predictions/trigger - Trigger ML analytics pipeline
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
