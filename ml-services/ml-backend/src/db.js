const { createClient } = require('@supabase/supabase-js')
const { Pool }         = require('pg')
require('dotenv').config()

// ── Supabase client (used by simulationEngine for Realtime-compatible writes)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service key bypasses RLS
)

// ── pg Pool (used by routes for complex PostGIS queries)
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'postgres',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASS,
  ssl:      { rejectUnauthorized: false },  // required for Supabase
  max:      10,
  idleTimeoutMillis: 30000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message)
})

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('[DB] PostgreSQL connected successfully'))
  .catch(err => console.error('[DB] Connection failed:', err.message))

module.exports = { supabase, pool }
