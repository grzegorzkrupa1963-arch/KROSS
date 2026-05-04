const { Router } = require('express');
const router = Router();

// POST /api/v1/auth/login
router.post('/login', (req, res) => res.status(501).json({ message: 'TODO' }));
// POST /api/v1/auth/register
router.post('/register', (req, res) => res.status(501).json({ message: 'TODO' }));
// POST /api/v1/auth/refresh
router.post('/refresh', (req, res) => res.status(501).json({ message: 'TODO' }));
// POST /api/v1/auth/logout
router.post('/logout', (req, res) => res.status(501).json({ message: 'TODO' }));

module.exports = router;
