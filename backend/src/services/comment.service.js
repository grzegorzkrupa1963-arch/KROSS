const db          = require('../config/db');
const ticketModel = require('../models/ticket.model');
const commentModel = require('../models/comment.model');
const auditModel  = require('../models/audit.model');

const STAFF_ROLES = ['admin', 'agent'];

async function assertTicketAccess(ticketId, requestingUser) {
  const ticket = await ticketModel.findById(ticketId);
  if (!ticket) {
    const err = new Error('Zgłoszenie nie istnieje');
    err.status = 404;
    throw err;
  }
  if (requestingUser.role === 'user' && ticket.created_by.id !== requestingUser.id) {
    const err = new Error('Brak dostępu do tego zgłoszenia');
    err.status = 403;
    throw err;
  }
  return ticket;
}

async function addComment(ticketId, { body, is_internal = false }, requestingUser) {
  await assertTicketAccess(ticketId, requestingUser);

  // Zwykły user nie może tworzyć komentarzy wewnętrznych
  const isInternal = STAFF_ROLES.includes(requestingUser.role) ? is_internal : false;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const row = await commentModel.create(client, {
      ticket_id:   ticketId,
      author_id:   requestingUser.id,
      body,
      is_internal: isInternal,
    });

    await auditModel.log(client, {
      user_id:   requestingUser.id,
      action:    'comment.create',
      entity:    'ticket',
      entity_id: ticketId,
      meta:      { comment_id: row.id, is_internal: isInternal },
    });

    await client.query('COMMIT');
    return commentModel.findById(row.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listComments(ticketId, requestingUser) {
  await assertTicketAccess(ticketId, requestingUser);
  const includeInternal = STAFF_ROLES.includes(requestingUser.role);
  return commentModel.findByTicket(ticketId, { includeInternal });
}

module.exports = { addComment, listComments };
