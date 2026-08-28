const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP.INTERNAL_SERVER_ERROR;
  let message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;

  // invalid mongodb id in url
  if (err.name === 'CastError') {
    statusCode = HTTP.BAD_REQUEST;
    message = MESSAGES.INVALID_RESOURCE_ID;
  }

  // duplicate value (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = HTTP.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  // mongoose schema validation failed
  if (err.name === 'ValidationError') {
    statusCode = HTTP.BAD_REQUEST;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // hide unexpected server crash details
  if (!err.isOperational && statusCode === HTTP.INTERNAL_SERVER_ERROR) {
    message = MESSAGES.INTERNAL_SERVER_ERROR;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
