const db = require('../config/db');

async function findAll() {
  const { rows } = await db.query(
    'SELECT id, name, description, created_at FROM categories ORDER BY name ASC'
  );
  return rows;
}

async function findById(id) {
  const { rows } = await db.query(
    'SELECT id, name, description, created_at FROM categories WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function create({ name, description }) {
  const { rows } = await db.query(
    `INSERT INTO categories (name, description) VALUES ($1, $2)
     RETURNING id, name, description, created_at`,
    [name, description || null]
  );
  return rows[0];
}

module.exports = { findAll, findById, create };
