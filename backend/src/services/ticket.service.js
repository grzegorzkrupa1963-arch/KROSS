const db = require('../config/db');
const ticketModel  = require('../models/ticket.model');
const historyModel = require('../models/history.model');
const auditModel   = require('../models/audit.model');

async function createTicket({ title, description, priority = 'medium', category_id }, userId) {
  await assertCategoryExists(category_id);

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const ticket = await ticketModel.create(client, {
      title, description,
      status: 'open',
      priority,
      category_id,
      created_by: userId,
    });

    const historyEntries = [
      { field_name: 'status',   old_value: null, new_value: 'open' },
      { field_name: 'priority', old_value: null, new_value: priority },
    ];
    if (category_id) {
      historyEntries.push({ field_name: 'category_id', old_value: null, new_value: category_id });
    }
    await historyModel.insertMany(client, ticket.id, userId, historyEntries);

    await auditModel.log(client, {
      user_id:   userId,
      action:    'ticket.create',
      entity:    'ticket',
      entity_id: ticket.id,
      meta:      { title, priority, category_id: category_id || null },
    });

    await client.query('COMMIT');
    return ticket;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getTicket(id, requestingUser) {
  const ticket = await ticketModel.findById(id);
  if (!ticket) {
    const err = new Error('Zgłoszenie nie istnieje');
    err.status = 404;
    throw err;
  }

  // Zwykły user widzi tylko własne zgłoszenia
  if (requestingUser.role === 'user' && ticket.created_by.id !== requestingUser.id) {
    const err = new Error('Brak dostępu do tego zgłoszenia');
    err.status = 403;
    throw err;
  }

  return ticket;
}

async function listTickets(filters, requestingUser) {
  const page  = Math.max(1, parseInt(filters.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));

  // User widzi tylko własne zgłoszenia; agent/admin widzi wszystkie
  if (requestingUser.role === 'user') {
    filters.created_by = requestingUser.id;
  }

  const result = await ticketModel.findAll({ ...filters, page, limit });
  return { ...result, page, limit };
}

async function assertCategoryExists(categoryId) {
  if (!categoryId) return;
  const { rows } = await db.query('SELECT 1 FROM categories WHERE id = $1', [categoryId]);
  if (!rows.length) {
    const err = new Error('Kategoria nie istnieje');
    err.status = 422;
    throw err;
  }
}

module.exports = { createTicket, getTicket, listTickets };
