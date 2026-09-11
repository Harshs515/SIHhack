const { supabase, parseWKBPoint } = require('./supabase');

module.exports = {
  query: async (text, params) => {
    // Legacy SQL wrapper mapping to Supabase JS
    if (text.includes('cybercrime_complaints')) {
      const { data, error } = await supabase
        .from('cybercrime_complaints')
        .select('*')
        .order('incident_timestamp', { ascending: false });
      if (error) throw error;
      const rows = (data || []).map((c) => {
        const coords = parseWKBPoint(c.geom);
        return {
          ...c,
          latitude: coords.latitude || 19.076,
          longitude: coords.longitude || 72.877,
        };
      });
      return { rows, rowCount: rows.length };
    }

    if (text.includes('predicted_hotspots')) {
      const [hRes, aRes, psRes] = await Promise.all([
        supabase.from('predicted_hotspots').select('*'),
        supabase.from('atm_locations').select('*'),
        supabase.from('police_stations').select('*'),
      ]);
      if (hRes.error) throw hRes.error;
      const atmsMap = Object.fromEntries((aRes.data || []).map((a) => [a.id, a]));
      const psMap = Object.fromEntries((psRes.data || []).map((p) => [p.id, p]));
      const rows = (hRes.data || []).map((h) => {
        const coords = parseWKBPoint(h.center_geom);
        const atm = atmsMap[h.atm_location_id] || {};
        const ps = psMap[h.assigned_police_station_id] || {};
        return {
          ...h,
          center_latitude: coords.latitude || 19.076,
          center_longitude: coords.longitude || 72.878,
          bank_name: atm.bank_name || 'Bank ATM',
          atm_id: atm.atm_id || 'N/A',
          atm_address: atm.address || 'Focus Zone',
          atm_risk_tier: atm.risk_tier || 'HIGH',
          police_station_name: ps.name || 'Cyber Police Station',
          police_contact: ps.contact_number || '1930',
        };
      });
      return { rows, rowCount: rows.length };
    }

    if (text.includes('atm_locations')) {
      const { data, error } = await supabase.from('atm_locations').select('*');
      if (error) throw error;
      const rows = (data || []).map((a) => {
        const coords = parseWKBPoint(a.geom);
        return { ...a, latitude: coords.latitude || 19.0755, longitude: coords.longitude || 72.878 };
      });
      return { rows, rowCount: rows.length };
    }

    if (text.includes('police_stations')) {
      const { data, error } = await supabase.from('police_stations').select('*');
      if (error) throw error;
      const rows = (data || []).map((ps) => {
        const coords = parseWKBPoint(ps.geom);
        return { ...ps, latitude: coords.latitude || 19.076, longitude: coords.longitude || 72.8777 };
      });
      return { rows, rowCount: rows.length };
    }

    return { rows: [], rowCount: 0 };
  },
  supabase,
};