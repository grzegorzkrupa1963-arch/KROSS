const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const router = Router();

router.use(authenticate);

// GET    /api/v1/tickets
router.get('/',        (req, res) => res.status(501).json({ message: 'TODO' }));
// POST   /api/v1/tickets
router.post('/',       (req, res) => res.status(501).json({ message: 'TODO' }));
// GET    /api/v1/tickets/:id
router.get('/:id',     (req, res) => res.status(501).json({ message: 'TODO' }));
// PATCH  /api/v1/tickets/:id
router.patch('/:id',   (req, res) => res.status(501).json({ message: 'TODO' }));
// DELETE /api/v1/tickets/:id
router.delete('/:id',  (req, res) => res.status(501).json({ message: 'TODO' }));
// POST   /api/v1/tickets/:id/comments
router.post('/:id/comments', (req, res) => res.status(501).json({ message: 'TODO' }));

module.exports = router;
