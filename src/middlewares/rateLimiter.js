const rateLimit = require('express-rate-limit');
const MESSAGES = require('../constants/messages');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: MESSAGES.TOO_MANY_REQUESTS,
  },
});

module.exports = { authLimiter };
