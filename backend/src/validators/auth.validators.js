const { body } = require('express-validator');

const registerRules = [
  body('email')
    .trim()
    .isEmail().withMessage('Podaj prawidłowy adres e-mail')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Hasło musi mieć minimum 8 znaków')
    .matches(/[A-Z]/).withMessage('Hasło musi zawierać co najmniej jedną wielką literę')
    .matches(/[0-9]/).withMessage('Hasło musi zawierać co najmniej jedną cyfrę'),
  body('first_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Imię może mieć maksymalnie 100 znaków'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Nazwisko może mieć maksymalnie 100 znaków'),
];

const loginRules = [
  body('email')
    .trim()
    .isEmail().withMessage('Podaj prawidłowy adres e-mail')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Hasło jest wymagane'),
];

module.exports = { registerRules, loginRules };
