const Joi = require('joi');
const MESSAGES = require('../constants/messages');

const createTicketSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': MESSAGES.TICKET_NAME_REQUIRED,
    'any.required': MESSAGES.TICKET_NAME_REQUIRED,
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': MESSAGES.TICKET_PRICE_INVALID,
    'any.required': MESSAGES.TICKET_PRICE_REQUIRED,
  }),
  totalQuantity: Joi.number().integer().min(1).required().messages({
    'number.min': MESSAGES.TICKET_QUANTITY_INVALID,
    'any.required': MESSAGES.TICKET_QUANTITY_REQUIRED,
  }),
});

module.exports = { createTicketSchema };
