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


  return {
    ...row,

    latitude,
    longitude,

    district:
      row.district ||
      fromAddress.district ||
      null,

    state:
      row.state ||
      fromAddress.state ||
      null,

    // Database uses victim_phone,
    // frontend can use victim_contact
    victim_contact:
      row.victim_contact ||
      row.victim_phone ||
      null,
  };
}


// ==================================================
// GET /api/complaints
// Fetch all complaints
// ==================================================
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cybercrime_complaints')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

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
// Track complaint by acknowledgement number
// ==================================================
router.get('/:ackNo', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cybercrime_complaints')
      .select('*')
      .eq(
        'acknowledgement_no',
        req.params.ackNo
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found',
      });
    }

    const complaint = mapComplaint(data);

    // Fetch linked/closest active hotspot for tactical intelligence
    const { data: hotspots } = await supabase
      .from('predicted_hotspots')
      .select('*')
      .in('status', ['ACTIVE', 'ACKNOWLEDGED'])
      .limit(5);

    const linkedHotspot = (hotspots || []).find(h => 
      h.district?.toLowerCase() === complaint.district?.toLowerCase() ||
      h.state?.toLowerCase() === complaint.state?.toLowerCase()
    ) || (hotspots && hotspots[0]) || null;

    if (linkedHotspot) {
      complaint.alert_level = linkedHotspot.alert_level || (linkedHotspot.risk_score >= 0.8 ? 'P1' : 'P2');
      complaint.risk_score = linkedHotspot.risk_score;
      complaint.actionable_intelligence = linkedHotspot.actionable_intelligence || 'Real-time high risk ATM withdrawal anomaly detected.';
      complaint.linked_hotspot = linkedHotspot;
    }

    res.json({
      success: true,
      data: complaint,
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