const db = require('../config/db');

function shapeComment(row) {
  return {
    id:          row.id,
    body:        row.body,
    is_internal: row.is_internal,
    created_at:  row.created_at,
    author: {
      id:         row.author_id,
      first_name: row.author_first_name,
      last_name:  row.author_last_name,
      email:      row.author_email,
    },
  };
}

async function create(client, { ticket_id, author_id, body, is_internal }) {
  const { rows } = await client.query(
    `INSERT INTO comments (ticket_id, author_id, body, is_internal)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [ticket_id, author_id, body, is_internal]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT
       c.id, c.body, c.is_internal, c.created_at,
       u.id         AS author_id,
       u.first_name AS author_first_name,
       u.last_name  AS author_last_name,
       u.email      AS author_email
     FROM comments c
     JOIN users u ON u.id = c.author_id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] ? shapeComment(rows[0]) : null;
}

async function findByTicket(ticketId, { includeInternal = false } = {}) {
  const { rows } = await db.query(
    `SELECT
       c.id, c.body, c.is_internal, c.created_at,
       u.id         AS author_id,
       u.first_name AS author_first_name,
       u.last_name  AS author_last_name,
       u.email      AS author_email
     FROM comments c
     JOIN users u ON u.id = c.author_id
     WHERE c.ticket_id = $1
       ${includeInternal ? '' : 'AND c.is_internal = FALSE'}
     ORDER BY c.created_at ASC`,
    [ticketId]
  );
  return rows.map(shapeComment);
}

module.exports = { create, findById, findByTicket };
