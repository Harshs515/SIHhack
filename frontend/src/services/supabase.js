const SUPABASE_URL = "https://odrcqeegkfscjunlpwmg.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

/**
 * Helper to parse EWKB point hex strings into { latitude, longitude }
 */
export function parseWKBPoint(hex) {
  if (!hex || typeof hex !== "string") return { latitude: null, longitude: null };
  try {
    const bytes = new Uint8Array(
      hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
    if (bytes.length < 25) return { latitude: null, longitude: null };

    const view = new DataView(bytes.buffer);
    const isLittleEndian = bytes[0] === 1;
    const hasSRID = (view.getUint32(1, isLittleEndian) & 0x20000000) !== 0;
    const offset = hasSRID ? 9 : 5;

    const lng = view.getFloat64(offset, isLittleEndian);
    const lat = view.getFloat64(offset + 8, isLittleEndian);

    return { latitude: lat, longitude: lng };
  } catch (e) {
    return { latitude: null, longitude: null };
  }
}

/**
 * Fetch all complaints directly from Supabase
 */
export async function fetchSupabaseComplaints() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cybercrime_complaints?select=*&order=incident_timestamp.desc`,
      { headers: HEADERS }
    );
    if (!res.ok) return null;
    const rawData = await res.json();
    return rawData.map((c) => {
      const coords = parseWKBPoint(c.geom);
      return {
        ...c,
        latitude: coords.latitude || c.latitude || 19.076,
        longitude: coords.longitude || c.longitude || 72.877,
      };
    });
  } catch (e) {
    console.error("Direct Supabase complaints fetch failed:", e);
    return null;
  }
}

/**
 * Fetch active predicted hotspots directly from Supabase
 */
export async function fetchSupabaseHotspots() {
  try {
    const [hRes, aRes, psRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/predicted_hotspots?select=*&status=eq.ACTIVE`, {
        headers: HEADERS,
      }),
      fetch(`${SUPABASE_URL}/rest/v1/atm_locations?select=*`, {
        headers: HEADERS,
      }),
      fetch(`${SUPABASE_URL}/rest/v1/police_stations?select=*`, {
        headers: HEADERS,
      }),
    ]);

    if (!hRes.ok) return null;
    const rawHotspots = await hRes.json();
    const rawAtms = aRes.ok ? await aRes.json() : [];
    const rawPolice = psRes.ok ? await psRes.json() : [];

    const atmsMap = Object.fromEntries(rawAtms.map((a) => [a.id, a]));
    const psMap = Object.fromEntries(rawPolice.map((p) => [p.id, p]));

    return rawHotspots.map((h) => {
      const coords = parseWKBPoint(h.center_geom);
      const atm = atmsMap[h.atm_location_id] || {};
      const ps = psMap[h.assigned_police_station_id] || {};

      return {
        ...h,
        center_latitude: coords.latitude || 19.076,
        center_longitude: coords.longitude || 72.878,
        bank_name: atm.bank_name || "Bank ATM",
        atm_id: atm.atm_id || "N/A",
        atm_address: atm.address || "Focus Zone",
        city: atm.city || ps.city || "India",
        state: atm.state || ps.state || "India",
        atm_risk_tier: atm.risk_tier || "CRITICAL",
        police_station_name: ps.station_name || "Cyber Crime Police Station",
        police_contact: ps.contact_number || "1930",
        alert_tier: h.alert_tier || (atm.risk_tier === "CRITICAL" ? "P1" : "P2"),
      };
    });
  } catch (e) {
    console.error("Direct Supabase hotspots fetch failed:", e);
    return null;
  }
}

/**
 * Fetch candidate ATMs directly from Supabase
 */
export async function fetchSupabaseAtms() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/atm_locations?select=*`, {
      headers: HEADERS,
    });
    if (!res.ok) return null;
    const rawData = await res.json();
    return rawData.map((a) => {
      const coords = parseWKBPoint(a.geom);
      return {
        ...a,
        latitude: coords.latitude || 19.0755,
        longitude: coords.longitude || 72.878,
      };
    });
  } catch (e) {
    console.error("Direct Supabase ATMs fetch failed:", e);
    return null;
  }
}

/**
 * Fetch Police Stations directly from Supabase
 */
export async function fetchSupabasePoliceStations() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/police_stations?select=*`, {
      headers: HEADERS,
    });
    if (!res.ok) return null;
    const rawData = await res.json();
    return rawData.map((ps) => {
      const coords = parseWKBPoint(ps.geom);
      return {
        ...ps,
        latitude: coords.latitude || 19.076,
        longitude: coords.longitude || 72.8777,
      };
    });
  } catch (e) {
    console.error("Direct Supabase Police Stations fetch failed:", e);
    return null;
  }
}
