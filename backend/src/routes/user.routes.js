const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = Router();

router.use(authenticate);

router.get('/',     authorize('admin'), (req, res) => res.status(501).json({ message: 'TODO' }));
router.get('/me',                       (req, res) => res.status(501).json({ message: 'TODO' }));
router.patch('/me',                     (req, res) => res.status(501).json({ message: 'TODO' }));
router.get('/:id',  authorize('admin'), (req, res) => res.status(501).json({ message: 'TODO' }));
router.patch('/:id',authorize('admin'), (req, res) => res.status(501).json({ message: 'TODO' }));

module.exports = router;
