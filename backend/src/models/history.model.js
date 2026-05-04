const db = require('../config/db');

function shapeEntry(row) {
  return {
    id:         row.id,
    field_name: row.field_name,
    old_value:  row.old_value,
    new_value:  row.new_value,
    changed_at: row.changed_at,
    changed_by: {
      id:         row.changer_id,
      first_name: row.changer_first_name,
      last_name:  row.changer_last_name,
      email:      row.changer_email,
    },
  };
}

// Accepts either a pool or a transaction client
async function insertMany(clientOrPool, ticketId, changedBy, entries) {
  if (!entries.length) return;
  for (const { field_name, old_value, new_value } of entries) {
    await clientOrPool.query(
      `INSERT INTO ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
       VALUES ($1, $2, $3, $4, $5)`,
      [ticketId, changedBy, field_name, old_value ?? null, new_value ?? null]
    );
  }
}

async function findByTicket(ticketId) {
  const { rows } = await db.query(
    `SELECT
       h.id, h.field_name, h.old_value, h.new_value, h.changed_at,
       u.id         AS changer_id,
       u.first_name AS changer_first_name,
       u.last_name  AS changer_last_name,
       u.email      AS changer_email
     FROM ticket_history h
     JOIN users u ON u.id = h.changed_by
     WHERE h.ticket_id = $1
     ORDER BY h.changed_at ASC`,
    [ticketId]
  );
  return rows.map(shapeEntry);
}

module.exports = { insertMany, findByTicket };
