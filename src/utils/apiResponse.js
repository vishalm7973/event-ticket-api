const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const sendSuccess = (res, data, message = MESSAGES.SUCCESS, statusCode = HTTP.OK) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = { sendSuccess };
