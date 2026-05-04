const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const controller = require('../controllers/ticket.controller');
const { createRules, listRules, uuidParam } = require('../validators/ticket.validators');

const router = Router();
router.use(authenticate);

router.get('/',    listRules,             controller.list);
router.post('/',   createRules,           controller.create);
router.get('/:id', uuidParam,             controller.getOne);

// Remaining routes stay as TODO stubs for future KRS tasks
router.patch('/:id',        (req, res) => res.status(501).json({ message: 'TODO' }));
router.delete('/:id',       (req, res) => res.status(501).json({ message: 'TODO' }));
router.post('/:id/comments',(req, res) => res.status(501).json({ message: 'TODO' }));

module.exports = router;
