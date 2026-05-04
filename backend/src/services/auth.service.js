const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const SALT_ROUNDS = 12;

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register({ email, password, first_name, last_name }) {
  if (await userModel.emailExists(email)) {
    const err = new Error('Konto z tym adresem e-mail już istnieje');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create({ email, password: hashed, first_name, last_name });
  const token = signToken({ id: user.id, role: user.role });

  return { user, token };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);

  // Stały czas porównania zapobiega timing attack — bcrypt.compare nawet przy braku usera
  const dummyHash = '$2a$12$invalidhashusedtopreventimingtimingattacks00000000000000';
  const match = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, dummyHash).then(() => false);

  if (!user || !match) {
    const err = new Error('Nieprawidłowy e-mail lub hasło');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Konto zostało dezaktywowane');
    err.status = 403;
    throw err;
  }

  const { password: _pw, ...safeUser } = user;
  const token = signToken({ id: safeUser.id, role: safeUser.role });

  return { user: safeUser, token };
}

async function getMe(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    const err = new Error('Użytkownik nie istnieje');
    err.status = 404;
    throw err;
  }
  return user;
}

module.exports = { register, login, getMe };
