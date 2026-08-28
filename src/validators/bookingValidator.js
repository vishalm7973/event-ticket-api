const Joi = require('joi');
const MESSAGES = require('../constants/messages');

const createBookingSchema = Joi.object({
  eventId: Joi.string().required().messages({
    'any.required': MESSAGES.BOOKING_EVENT_ID_REQUIRED,
  }),
  ticketId: Joi.string().required().messages({
    'any.required': MESSAGES.BOOKING_TICKET_ID_REQUIRED,
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': MESSAGES.BOOKING_QUANTITY_INVALID,
    'any.required': MESSAGES.BOOKING_QUANTITY_REQUIRED,
  }),
});

module.exports = { createBookingSchema };
