const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase URL or secret key is missing in .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Converts PostGIS Point data into latitude/longitude.
 */
function parseWKBPoint(value) {
  if (!value) {
    return {
      latitude: null,
      longitude: null,
    };
  }

  // GeoJSON object
  if (typeof value === 'object') {
    const coords = value.coordinates || value.coordinate;

    if (Array.isArray(coords) && coords.length >= 2) {
      return {
        latitude: Number(coords[1]),
        longitude: Number(coords[0]),
      };
    }

    return {
      latitude: null,
      longitude: null,
    };
  }

  if (typeof value !== 'string') {
    return {
      latitude: null,
      longitude: null,
    };
  }

  // WKT: POINT(lng lat)
  const wktMatch = value.match(
    /POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i
  );

  if (wktMatch) {
    return {
      latitude: Number(wktMatch[2]),
      longitude: Number(wktMatch[1]),
    };
  }

  // PostGIS EWKB hex
  try {
    const buf = Buffer.from(value, 'hex');

    if (buf.length < 21) {
      return {
        latitude: null,
        longitude: null,
      };
    }

    const isLittleEndian = buf[0] === 1;

    const geometryType = isLittleEndian
      ? buf.readUInt32LE(1)
      : buf.readUInt32BE(1);

    // EWKB SRID flag
    const hasSRID = (geometryType & 0x20000000) !== 0;

    const offset = hasSRID ? 9 : 5;

    const longitude = isLittleEndian
      ? buf.readDoubleLE(offset)
      : buf.readDoubleBE(offset);

    const latitude = isLittleEndian
      ? buf.readDoubleLE(offset + 8)
      : buf.readDoubleBE(offset + 8);

    return {
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('Error parsing PostGIS geometry:', error);

    return {
      latitude: null,
      longitude: null,
    };
  }
}

module.exports = {
  supabase,
  parseWKBPoint,
};