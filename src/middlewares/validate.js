const AppError = require('../utils/AppError');
const HTTP = require('../constants/httpStatus');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(', ');
    return next(new AppError(message, HTTP.BAD_REQUEST));
  }

  req.body = value;
  next();
};

module.exports = validate;
