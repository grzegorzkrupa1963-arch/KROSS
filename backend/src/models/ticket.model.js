const db = require('../config/db');

// Fields used in list view — lean, no description
const LIST_FIELDS = `
  t.id, t.title, t.status, t.priority, t.created_at,
  t.category_id,   c.name  AS category_name,
  t.created_by,
  cr.first_name    AS creator_first_name,
  cr.last_name     AS creator_last_name,
  cr.email         AS creator_email,
  t.assigned_to,
  a.first_name     AS assignee_first_name,
  a.last_name      AS assignee_last_name,
  a.email          AS assignee_email
`;

// Fields used in detail view — full data
const DETAIL_FIELDS = `
  t.id, t.title, t.description, t.status, t.priority,
  t.category_id, t.created_by, t.assigned_to,
  t.created_at, t.updated_at, t.resolved_at,
  c.name         AS category_name,
  cr.first_name  AS creator_first_name,
  cr.last_name   AS creator_last_name,
  cr.email       AS creator_email,
  a.first_name   AS assignee_first_name,
  a.last_name    AS assignee_last_name,
  a.email        AS assignee_email
`;

const LIST_JOINS = `
  LEFT JOIN categories c  ON c.id  = t.category_id
  LEFT JOIN users      cr ON cr.id = t.created_by
  LEFT JOIN users      a  ON a.id  = t.assigned_to
`;

const DETAIL_JOINS = `
  LEFT JOIN categories c  ON c.id  = t.category_id
  LEFT JOIN users      cr ON cr.id = t.created_by
  LEFT JOIN users      a  ON a.id  = t.assigned_to
`;

function shapeListItem(row) {
  return {
    id:          row.id,
    title:       row.title,
    status:      row.status,
    priority:    row.priority,
    category:    row.category_id
      ? { id: row.category_id, name: row.category_name }
      : null,
    created_by:  { id: row.created_by, first_name: row.creator_first_name, last_name: row.creator_last_name, email: row.creator_email },
    created_at:  row.created_at,
    assigned_to: row.assigned_to
      ? { id: row.assigned_to, first_name: row.assignee_first_name, last_name: row.assignee_last_name, email: row.assignee_email }
      : null,
  };
}

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
    `SELECT ${DETAIL_FIELDS} FROM tickets t ${DETAIL_JOINS} WHERE t.id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id:          r.id,
    title:       r.title,
    description: r.description,
    status:      r.status,
    priority:    r.priority,
    category:    r.category_id ? { id: r.category_id, name: r.category_name } : null,
    created_by:  { id: r.created_by, first_name: r.creator_first_name, last_name: r.creator_last_name, email: r.creator_email },
    assigned_to: r.assigned_to ? { id: r.assigned_to, first_name: r.assignee_first_name, last_name: r.assignee_last_name, email: r.assignee_email } : null,
    created_at:  r.created_at,
    updated_at:  r.updated_at,
    resolved_at: r.resolved_at,
  };
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
    `SELECT ${LIST_FIELDS} FROM tickets t ${LIST_JOINS}
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

  return {
    data:  rows.map(shapeListItem),
    total: parseInt(countRows[0].count),
  };
}

const UPDATABLE = ['status', 'priority', 'category_id', 'assigned_to', 'resolved_at'];

async function update(client, id, fields) {
  const setClauses = [];
  const params = [];

  for (const key of UPDATABLE) {
    if (key in fields) {
      params.push(fields[key] ?? null);
      setClauses.push(`${key} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) return null;

  params.push(id);
  const { rows } = await client.query(
    `UPDATE tickets SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
}

module.exports = { create, findById, findAll, update };
