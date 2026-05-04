// Accepts either a pool or a transaction client
async function log(clientOrPool, { user_id, action, entity, entity_id, meta }) {
  await clientOrPool.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, meta)
     VALUES ($1, $2, $3, $4, $5)`,
    [user_id || null, action, entity || null, entity_id || null, meta ? JSON.stringify(meta) : null]
  );
}

module.exports = { log };
