const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/complaints - Fetch all active cybercrime complaints
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, acknowledgement_no, victim_name, victim_contact, 
        fraud_category, fraud_amount, incident_timestamp, 
        mule_bank_name, mule_account_no, victim_address, 
        ST_Y(geom::geometry) AS latitude, 
        ST_X(geom::geometry) AS longitude, 
        status,
        ST_AsGeoJSON(geom::geometry)::json AS geometry
      FROM cybercrime_complaints
      ORDER BY incident_timestamp DESC;
    `;
    const result = await db.query(query);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/complaints - Report new cybercrime complaint
router.post('/', async (req, res) => {
  const {
    acknowledgement_no, victim_name, victim_contact,
    fraud_category, fraud_amount, incident_timestamp,
    mule_bank_name, mule_account_no, victim_address,
    latitude, longitude
  } = req.body;

  try {
    const query = `
      INSERT INTO cybercrime_complaints (
        acknowledgement_no, victim_name, victim_contact,
        fraud_category, fraud_amount, incident_timestamp,
        mule_bank_name, mule_account_no, victim_address,
        geom
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        ST_GeographyFromText('POINT(' || $11 || ' ' || $10 || ')')
      ) RETURNING *, ST_Y(geom::geometry) AS latitude, ST_X(geom::geometry) AS longitude;
    `;
    const values = [
      acknowledgement_no, victim_name, victim_contact,
      fraud_category, fraud_amount, incident_timestamp || new Date(),
      mule_bank_name, mule_account_no, victim_address,
      latitude, longitude
    ];
    const result = await db.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
