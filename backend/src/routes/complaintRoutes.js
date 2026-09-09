const express = require('express');
const router = express.Router();
const { supabase, parseWKBPoint } = require('../supabase');

// GET /api/complaints - Fetch all active cybercrime complaints from Supabase
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cybercrime_complaints')
      .select('*')
      .order('incident_timestamp', { ascending: false });

    if (error) throw error;

    const complaints = (data || []).map((c) => {
      const coords = parseWKBPoint(c.geom);
      return {
        ...c,
        latitude: coords.latitude || c.latitude || 19.076,
        longitude: coords.longitude || c.longitude || 72.877,
      };
    });

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    console.error('Error fetching complaints from Supabase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/complaints - Report new cybercrime complaint to Supabase
router.post('/', async (req, res) => {
  const {
    acknowledgement_no,
    victim_name,
    victim_contact,
    fraud_category,
    fraud_amount,
    incident_timestamp,
    mule_bank_name,
    mule_account_no,
    victim_address,
    latitude,
    longitude,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from('cybercrime_complaints')
      .insert([
        {
          acknowledgement_no: acknowledgement_no || `ACK-${Date.now()}`,
          victim_name,
          victim_contact,
          fraud_category: fraud_category || 'Cyber Fraud',
          fraud_amount: parseFloat(fraud_amount) || 0,
          incident_timestamp: incident_timestamp || new Date().toISOString(),
          mule_bank_name,
          mule_account_no,
          victim_address,
          status: 'ACTIVE',
        },
      ])
      .select();

    if (error) throw error;

    const inserted = data[0];
    res.status(201).json({
      success: true,
      data: {
        ...inserted,
        latitude: parseFloat(latitude) || 19.076,
        longitude: parseFloat(longitude) || 72.877,
      },
    });
  } catch (error) {
    console.error('Error creating complaint in Supabase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
