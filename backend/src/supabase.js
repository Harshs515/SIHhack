const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://odrcqeegkfscjunlpwmg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || 'sb_secret_8s195YdPUTL-ddd4I4z51Q_FUtcp1t1';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Parses PostGIS EWKB hex string into latitude and longitude double floats
 */
function parseWKBPoint(hex) {
  if (!hex || typeof hex !== 'string') return { latitude: null, longitude: null };
  try {
    const buf = Buffer.from(hex, 'hex');
    if (buf.length < 25) return { latitude: null, longitude: null };
    const isLittleEndian = buf[0] === 1;
    const hasSRID = (buf.readUInt32LE(1) & 0x20000000) !== 0;
    const offset = hasSRID ? 9 : 5;
    const lng = isLittleEndian ? buf.readDoubleLE(offset) : buf.readDoubleBE(offset);
    const lat = isLittleEndian ? buf.readDoubleLE(offset + 8) : buf.readDoubleBE(offset + 8);
    return { latitude: lat, longitude: lng };
  } catch (e) {
    return { latitude: null, longitude: null };
  }
}

module.exports = {
  supabase,
  parseWKBPoint
};
