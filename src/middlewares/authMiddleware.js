const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(MESSAGES.NO_TOKEN, HTTP.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(MESSAGES.INVALID_TOKEN, HTTP.UNAUTHORIZED);
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP.UNAUTHORIZED);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(MESSAGES.NOT_AUTHORIZED, HTTP.FORBIDDEN));
  }
  next();
};

module.exports = { authenticate, authorize };
