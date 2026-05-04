const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { registerRules, loginRules } = require('../validators/auth.validators');

const router = Router();

router.post('/register', registerRules, controller.register);
router.post('/login',    loginRules,    controller.login);
router.post('/logout',   authenticate,  controller.logout);
router.get('/me',        authenticate,  controller.me);

module.exports = router;
