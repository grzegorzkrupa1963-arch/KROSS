const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const categoryModel = require('../models/category.model');
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const data = await categoryModel.findAll();
    res.json({ data });
  } catch (err) { next(err); }
});

router.post('/', authorize('admin'),
  body('name').trim().notEmpty().withMessage('Nazwa jest wymagana').isLength({ max: 100 }),
  body('description').optional().trim(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const existing = await categoryModel.findAll()
        .then((rows) => rows.some((r) => r.name.toLowerCase() === req.body.name.trim().toLowerCase()));
      if (existing) return res.status(409).json({ error: 'Kategoria o tej nazwie już istnieje' });
      const category = await categoryModel.create(req.body);
      res.status(201).json({ category });
    } catch (err) { next(err); }
  }
);

router.patch('/:id', authorize('admin'), (req, res) => res.status(501).json({ message: 'TODO' }));
router.delete('/:id', authorize('admin'), (req, res) => res.status(501).json({ message: 'TODO' }));

module.exports = router;
