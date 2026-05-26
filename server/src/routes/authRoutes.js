const express = require('express');
const { body } = require('express-validator');
const { serverlessRateLimit } = require('../utils/rateLimit');
const { authenticateToken } = require('../middleware/auth');
const { login, me } = require('../controllers/authController');

const router = express.Router();

const authLimiter = serverlessRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

router.use(authLimiter);

router.post(
  '/login',
  [
    body('username').trim().escape().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', authenticateToken, me);

module.exports = router;
