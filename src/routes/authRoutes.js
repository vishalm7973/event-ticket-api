const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
