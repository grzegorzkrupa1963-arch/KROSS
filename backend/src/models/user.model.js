const db = require('../config/db');

const PUBLIC_FIELDS = `id, email, first_name, last_name, role, is_active, created_at, updated_at`;

async function findByEmail(email) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_FIELDS}, password FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ email, password, first_name, last_name, role = 'user' }) {
  const { rows } = await db.query(
    `INSERT INTO users (email, password, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${PUBLIC_FIELDS}`,
    [email.toLowerCase(), password, first_name || null, last_name || null, role]
  );
  return rows[0];
}

async function emailExists(email) {
  const { rows } = await db.query(
    'SELECT 1 FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return rows.length > 0;
}

module.exports = { findByEmail, findById, create, emailExists };
