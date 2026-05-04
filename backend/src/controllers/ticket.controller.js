const { validationResult } = require('express-validator');
const ticketService = require('../services/ticket.service');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    return true;
  }
  return false;
}

async function create(req, res, next) {
  if (handleValidation(req, res)) return;
  try {
    const ticket = await ticketService.createTicket(req.body, req.user.id);
    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  if (handleValidation(req, res)) return;
  try {
    const ticket = await ticketService.getTicket(req.params.id, req.user);
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  if (handleValidation(req, res)) return;
  try {
    const { page, limit, status, priority, assigned_to } = req.query;
    const result = await ticketService.listTickets({ page, limit, status, priority, assigned_to }, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  if (handleValidation(req, res)) return;
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user);
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getOne, list, update };
