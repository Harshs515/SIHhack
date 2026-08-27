const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cybercrime_db',
  user: process.env.DB_USER || 'mha_admin',
  password: process.env.DB_PASS || 'SecureMHA_Pass2026',
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL PostGIS Database');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
