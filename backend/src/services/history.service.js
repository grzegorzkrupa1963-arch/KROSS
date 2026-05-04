const ticketModel  = require('../models/ticket.model');
const historyModel = require('../models/history.model');

async function listHistory(ticketId, requestingUser) {
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

  return historyModel.findByTicket(ticketId);
}

module.exports = { listHistory };
