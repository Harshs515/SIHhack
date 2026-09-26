const express = require('express');

const router = express.Router();

const { supabase, parseWKBPoint } = require('../supabase');


// ==================================================
// Split address into district and state
// ==================================================
function splitAddress(address) {
  if (!address) {
    return {
      district: '',
      state: '',
    };
  }

  const parts = String(address)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    district: parts[0] || '',
    state: parts.slice(1).join(', ') || '',
  };
}


// ==================================================
// Map database complaint to API response
// ==================================================
function mapComplaint(row, fallbackLat, fallbackLng) {
  const coords = parseWKBPoint(row.geom);

  const fromAddress = splitAddress(row.victim_address);

  const latitude =
    coords.latitude ??
    fallbackLat ??
    row.latitude ??
    19.076;

  const longitude =
    coords.longitude ??
    fallbackLng ??
    row.longitude ??
    72.877;

  // Parse raw_reference JSON if available
  let rawData = {};
  if (row.raw_reference) {
    try {
      rawData = typeof row.raw_reference === 'string' 
        ? JSON.parse(row.raw_reference) 
        : row.raw_reference;
    } catch (e) {
      console.warn('Failed to parse raw_reference:', e);
    }
  }

  return {
    ...row,

    // Map database fields to frontend expectations (Fix 2A)
    acknowledgement_no: row.complaint_id || rawData.acknowledgement_no || row.id,
    fraud_category: row.crime_category || rawData.fraud_category || 'Unknown Fraud',
    fraud_amount: parseFloat(row.amount || rawData.fraud_amount || rawData.amount_lost || 0) || 0,
    incident_timestamp: row.complaint_date || rawData.incident_timestamp || row.created_at,
    
    // Extract victim details: use complainant_type as victim_name (BUG 3A)
    victim_name: row.complainant_type || row.victim_name || rawData.victim_name || 'Not provided',
    victim_phone: rawData.victim_phone || rawData.victim_contact || null,
    victim_contact: rawData.victim_phone || rawData.victim_contact || null,
    victim_bank: rawData.victim_bank || null,
    mule_bank_name: rawData.mule_bank_name || null,
    mule_account_no: rawData.suspect_transaction_id || null,

    latitude,
    longitude,
    // Also expose as lat/lng for map components
    lat: latitude,
    lng: longitude,

    district:
      row.district ||
      fromAddress.district ||
      null,

    state:
      row.state ||
      fromAddress.state ||
      null,
  };
}


// ==================================================
// GET /api/complaints
// Fetch all complaints with optional search
// ==================================================
router.get('/', async (req, res) => {
  try {
    const { search, limit, status } = req.query;

    let query = supabase
      .from('complaints')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    // Apply status filter if provided (Fix 2B)
    if (status && status.trim() && status.toUpperCase() !== 'ALL') {
      query = query.eq('status', status.trim());
    }

    // Apply search filter if provided — use actual complaints table column names
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      query = query.or(
        `complaint_id.ilike.%${searchTerm}%,` +
        `crime_category.ilike.%${searchTerm}%,` +
        `district.ilike.%${searchTerm}%,` +
        `state.ilike.%${searchTerm}%,` +
        `city.ilike.%${searchTerm}%`
      );
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const complaints = (data || []).map((complaint) =>
      mapComplaint(complaint)
    );

    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    });

  } catch (error) {
    console.error(
      'Error fetching complaints:',
      error
    );

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ==================================================
// GET /api/complaints/:ackNo
// Track complaint by acknowledgement number (BUG 5A)
// ==================================================
router.get('/:ackNo', async (req, res) => {
  try {
    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*')
      .eq(
        'complaint_id',   // Fix 2C: use complaint_id column (text ack number)
        req.params.ackNo
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found',
      });
    }

    // Join predicted_hotspots using integer FK complaint.id (BUG 5A)
    let prediction = null;
    const { data: hotspot } = await supabase
      .from('predicted_hotspots')
      .select('alert_level, risk_score, district, state, actionable_intelligence, status, predicted_window_end, prediction_source, session_id, session_status')
      .eq('complaint_id', complaint.id)   // integer FK join
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (hotspot) {
      prediction = hotspot;
    }

    const mapped = mapComplaint(complaint);

    const enrichedStatus = prediction
      ? (prediction.alert_level ? 'PROCESSED' : complaint.status)
      : complaint.status;

    const predictionData = prediction ? {
      alert_level:             prediction.alert_level,
      risk_score:              prediction.risk_score,
      predicted_district:      prediction.district,
      predicted_state:         prediction.state,
      actionable_intelligence: prediction.actionable_intelligence,
      predicted_window_end:    prediction.predicted_window_end,
      prediction_source:       prediction.prediction_source,
      session_intercepted:     prediction.prediction_source === 'SESSION_INTERCEPT',
    } : null;

    res.json({
      success: true,
      acknowledgement_no:     complaint.complaint_id,
      fraud_category:         complaint.crime_category,
      amount:                 complaint.amount,
      district:               complaint.district,
      state:                  complaint.state,
      filed_at:               complaint.complaint_date || complaint.created_at,
      status:                 enrichedStatus,
      prediction:             predictionData,
      data: {
        ...mapped,
        status: enrichedStatus,
        prediction: predictionData,
      },
    });

  } catch (error) {
    console.error(
      'Error tracking complaint:',
      error
    );

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ==================================================
// POST /api/complaints
// Create new cybercrime complaint
// ==================================================
router.post('/', async (req, res) => {
  try {

    const {
      acknowledgement_no,

      victim_name,
      victim_contact,
      victim_phone,

      fraud_category,
      fraud_amount,

      incident_timestamp,

      mule_bank_name,
      mule_account_no,

      victim_address,

      district,
      state,

      latitude,
      longitude,

      lat,
      lng,
    } = req.body;


    // ----------------------------------------------
    // Resolve latitude
    // ----------------------------------------------
    const resolvedLat =
      latitude ?? lat;


    // ----------------------------------------------
    // Resolve longitude
    // ----------------------------------------------
    const resolvedLng =
      longitude ?? lng;


    // ----------------------------------------------
    // Validate coordinates
    // ----------------------------------------------
    const finalLat =
      Number.isFinite(Number(resolvedLat))
        ? Number(resolvedLat)
        : 28.7041;

    const finalLng =
      Number.isFinite(Number(resolvedLng))
        ? Number(resolvedLng)
        : 77.1025;


    // ----------------------------------------------
    // Create address
    // ----------------------------------------------
    const address =
      victim_address ||
      [district, state]
        .filter(Boolean)
        .join(', ') ||
      null;


    // ----------------------------------------------
    // Generate acknowledgement number
    // ----------------------------------------------
    const acknowledgement =
      acknowledgement_no ||
      `ACK-${Date.now()}`;


    // ----------------------------------------------
    // Insert using PostgreSQL RPC
    //
    // IMPORTANT:
    // The PostgreSQL function creates the
    // PostGIS geometry using ST_MakePoint().
    // ----------------------------------------------
    const { data, error } = await supabase.rpc(
      'create_cybercrime_complaint',
      {
        p_acknowledgement_no:
          acknowledgement,

        p_victim_name:
          victim_name || null,

        p_victim_phone:
          victim_phone ||
          victim_contact ||
          null,

        p_fraud_category:
          fraud_category ||
          'Cyber Fraud',

        p_fraud_amount:
          parseFloat(fraud_amount) || 0,

        p_incident_timestamp:
          incident_timestamp ||
          new Date().toISOString(),

        p_mule_bank_name:
          mule_bank_name || null,

        p_mule_account_no:
          mule_account_no || null,

        p_victim_address:
          address,

        p_district:
          district || null,

        p_state:
          state || null,

        p_latitude:
          finalLat,

        p_longitude:
          finalLng,
      }
    );


    // ----------------------------------------------
    // Check Supabase error
    // ----------------------------------------------
    if (error) {
      throw error;
    }


    // ----------------------------------------------
    // RPC returns the inserted row
    // ----------------------------------------------
    if (!data) {
      throw new Error(
        'Complaint was not inserted'
      );
    }


    // ----------------------------------------------
    // Send successful response
    // ----------------------------------------------
    res.status(201).json({
      success: true,

      message:
        'Complaint registered successfully',

      data: mapComplaint(
        data,
        finalLat,
        finalLng
      ),
    });


  } catch (error) {

    console.error(
      'Error creating complaint:',
      error
    );

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


module.exports = router;