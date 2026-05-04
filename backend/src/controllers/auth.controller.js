const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    return true;
  }
  return false;
}

async function register(req, res, next) {
  if (handleValidation(req, res)) return;
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  if (handleValidation(req, res)) return;
  try {
    const { user, token } = await authService.login(req.body);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

function logout(_req, res) {
  // Token jest po stronie klienta — wystarczy potwierdzenie wylogowania.
  // Przy wdrożeniu refresh tokenów: unieważnij token w DB tutaj.
  res.json({ message: 'Wylogowano pomyślnie' });
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
