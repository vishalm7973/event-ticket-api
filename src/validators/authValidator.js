const Joi = require('joi');
const MESSAGES = require('../constants/messages');

const registerSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    'string.empty': MESSAGES.FIRST_NAME_REQUIRED,
    'any.required': MESSAGES.FIRST_NAME_REQUIRED,
  }),
  lastName: Joi.string().trim().required().messages({
    'string.empty': MESSAGES.LAST_NAME_REQUIRED,
    'any.required': MESSAGES.LAST_NAME_REQUIRED,
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': MESSAGES.VALID_EMAIL_REQUIRED,
    'string.empty': MESSAGES.VALID_EMAIL_REQUIRED,
    'any.required': MESSAGES.VALID_EMAIL_REQUIRED,
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': MESSAGES.PASSWORD_MIN_LENGTH,
    'any.required': MESSAGES.PASSWORD_REQUIRED,
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': MESSAGES.VALID_EMAIL_REQUIRED,
    'string.empty': MESSAGES.VALID_EMAIL_REQUIRED,
    'any.required': MESSAGES.VALID_EMAIL_REQUIRED,
  }),
  password: Joi.string().required().messages({
    'any.required': MESSAGES.PASSWORD_REQUIRED,
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': MESSAGES.REFRESH_TOKEN_REQUIRED,
  }),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
