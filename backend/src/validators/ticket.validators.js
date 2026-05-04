const { body, query, param } = require('express-validator');

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES   = ['open', 'in_progress', 'resolved', 'closed'];

const createRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Tytuł jest wymagany')
    .isLength({ max: 255 }).withMessage('Tytuł może mieć maksymalnie 255 znaków'),
  body('description')
    .trim()
    .notEmpty().withMessage('Opis jest wymagany'),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priorytet musi być jednym z: ${VALID_PRIORITIES.join(', ')}`),
  body('category_id')
    .optional({ nullable: true })
    .isUUID().withMessage('category_id musi być prawidłowym UUID'),
];

const listRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page musi być liczbą całkowitą >= 1').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit musi być między 1 a 100').toInt(),
  query('status').optional().isIn(VALID_STATUSES).withMessage(`status musi być jednym z: ${VALID_STATUSES.join(', ')}`),
  query('priority').optional().isIn(VALID_PRIORITIES).withMessage(`priority musi być jednym z: ${VALID_PRIORITIES.join(', ')}`),
  query('assigned_to').optional().isUUID().withMessage('assigned_to musi być prawidłowym UUID'),
];

const uuidParam = [
  param('id').isUUID().withMessage('id musi być prawidłowym UUID'),
];

const createCommentRules = [
  param('id').isUUID().withMessage('id zgłoszenia musi być prawidłowym UUID'),
  body('body')
    .trim()
    .notEmpty().withMessage('Treść komentarza jest wymagana')
    .isLength({ max: 10000 }).withMessage('Komentarz może mieć maksymalnie 10 000 znaków'),
  body('is_internal')
    .optional()
    .isBoolean().withMessage('is_internal musi być wartością true lub false')
    .toBoolean(),
];

const patchRules = [
  param('id').isUUID().withMessage('id musi być prawidłowym UUID'),
  body('assigned_to')
    .optional({ nullable: true })
    .custom((v) => v === null || /^[0-9a-f-]{36}$/i.test(v))
    .withMessage('assigned_to musi być prawidłowym UUID lub null'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`status musi być jednym z: ${VALID_STATUSES.join(', ')}`),
];

module.exports = { createRules, listRules, uuidParam, createCommentRules, patchRules, VALID_PRIORITIES, VALID_STATUSES };
