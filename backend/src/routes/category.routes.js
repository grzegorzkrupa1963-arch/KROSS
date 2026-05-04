const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = Router();

router.use(authenticate);

router.get('/',      (req, res) => res.status(501).json({ message: 'TODO' }));
router.post('/',     authorize('admin'), (req, res) => res.status(501).json({ message: 'TODO' }));
router.patch('/:id', authorize('admin'), (req, res) => res.status(501).json({ message: 'TODO' }));
router.delete('/:id',authorize('admin'), (req, res) => res.status(501).json({ message: 'TODO' }));

module.exports = router;
