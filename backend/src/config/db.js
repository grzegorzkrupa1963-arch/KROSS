const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  min:      parseInt(process.env.DB_POOL_MIN || '2'),
  max:      parseInt(process.env.DB_POOL_MAX || '10'),
});

pool.on('error', (err) => console.error('Unexpected DB pool error', err));

module.exports = pool;
