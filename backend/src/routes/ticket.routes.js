const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const ticketController  = require('../controllers/ticket.controller');
const commentController = require('../controllers/comment.controller');
const { createRules, listRules, uuidParam, createCommentRules } = require('../validators/ticket.validators');

const router = Router();
router.use(authenticate);

router.get('/',    listRules,  ticketController.list);
router.post('/',   createRules, ticketController.create);
router.get('/:id', uuidParam,   ticketController.getOne);

router.get( '/:id/comments', uuidParam,          commentController.list);
router.post('/:id/comments', createCommentRules,  commentController.create);

// Stubs for future KRS tasks
router.patch('/:id',  (req, res) => res.status(501).json({ message: 'TODO' }));
router.delete('/:id', (req, res) => res.status(501).json({ message: 'TODO' }));

module.exports = router;
