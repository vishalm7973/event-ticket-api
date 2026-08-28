const AppError = require('../utils/AppError');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const notFound = (req, res, next) => {
  next(new AppError(MESSAGES.ROUTE_NOT_FOUND, HTTP.NOT_FOUND));
};

module.exports = notFound;
