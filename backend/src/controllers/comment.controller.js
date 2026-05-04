const { validationResult } = require('express-validator');
const commentService = require('../services/comment.service');

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
    const comment = await commentService.addComment(req.params.id, req.body, req.user);
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  if (handleValidation(req, res)) return;
  try {
    const comments = await commentService.listComments(req.params.id, req.user);
    res.json({ data: comments, total: comments.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list };
