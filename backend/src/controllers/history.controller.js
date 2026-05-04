const { validationResult } = require('express-validator');
const historyService = require('../services/history.service');

async function list(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  }
  try {
    const entries = await historyService.listHistory(req.params.id, req.user);
    res.json({ data: entries, total: entries.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
