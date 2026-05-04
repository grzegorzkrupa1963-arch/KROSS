const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const ticketController  = require('../controllers/ticket.controller');
const commentController = require('../controllers/comment.controller');
const historyController = require('../controllers/history.controller');
const { createRules, listRules, uuidParam, createCommentRules, patchRules } = require('../validators/ticket.validators');

const router = Router();
router.use(authenticate);

router.get('/',    listRules,  ticketController.list);
router.post('/',   createRules, ticketController.create);
router.get('/:id', uuidParam,   ticketController.getOne);

router.get( '/:id/comments', uuidParam,          commentController.list);
router.post('/:id/comments', createCommentRules,  commentController.create);
router.get( '/:id/history',  uuidParam,           historyController.list);

router.patch('/:id',  patchRules, ticketController.update);
router.delete('/:id', (req, res) => res.status(501).json({ message: 'TODO' }));

module.exports = router;
