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

// add seats → total +n, available +n
// remove seats → total -n, available -n (only if enough available)
const updateTicketAvailabilitySchema = Joi.object({
  add: Joi.number().integer().min(1),
  remove: Joi.number().integer().min(1),
})
  .xor('add', 'remove')
  .messages({
    'object.xor': MESSAGES.TICKET_CAPACITY_CHANGE_REQUIRED,
    'object.missing': MESSAGES.TICKET_CAPACITY_CHANGE_REQUIRED,
  });

module.exports = { createTicketSchema, updateTicketAvailabilitySchema };
