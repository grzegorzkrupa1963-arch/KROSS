const db = require('../config/db');

const TICKET_FIELDS = `
  t.id, t.title, t.description, t.status, t.priority,
  t.category_id, t.created_by, t.assigned_to,
  t.created_at, t.updated_at, t.resolved_at,
  c.name AS category_name,
  u.first_name AS creator_first_name, u.last_name AS creator_last_name, u.email AS creator_email
`;

async function create(client, { title, description, status, priority, category_id, created_by }) {
  const { rows } = await client.query(
    `INSERT INTO tickets (title, description, status, priority, category_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, description, status, priority, category_id || null, created_by]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${TICKET_FIELDS}
     FROM tickets t
     LEFT JOIN categories c ON c.id = t.category_id
     LEFT JOIN users u ON u.id = t.created_by
     WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function findAll({ page = 1, limit = 20, status, priority, created_by, assigned_to } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (status)      { params.push(status);      conditions.push(`t.status = $${params.length}`); }
  if (priority)    { params.push(priority);     conditions.push(`t.priority = $${params.length}`); }
  if (created_by)  { params.push(created_by);   conditions.push(`t.created_by = $${params.length}`); }
  if (assigned_to) { params.push(assigned_to);  conditions.push(`t.assigned_to = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(limit, offset);
  const { rows } = await db.query(
    `SELECT ${TICKET_FIELDS}
     FROM tickets t
     LEFT JOIN categories c ON c.id = t.category_id
     LEFT JOIN users u ON u.id = t.created_by
     ${where}
     ORDER BY t.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = params.slice(0, -2);
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) FROM tickets t ${where}`,
    countParams
  );

  return { data: rows, total: parseInt(countRows[0].count) };
}

module.exports = { create, findById, findAll };
