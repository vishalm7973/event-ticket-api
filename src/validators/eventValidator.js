const Joi = require('joi');
const MESSAGES = require('../constants/messages');
const EVENT_STATUS = require('../constants/eventStatus');

const createEventSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': MESSAGES.EVENT_TITLE_REQUIRED,
    'any.required': MESSAGES.EVENT_TITLE_REQUIRED,
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': MESSAGES.EVENT_DESCRIPTION_REQUIRED,
    'any.required': MESSAGES.EVENT_DESCRIPTION_REQUIRED,
  }),
  venue: Joi.string().trim().required().messages({
    'string.empty': MESSAGES.EVENT_VENUE_REQUIRED,
    'any.required': MESSAGES.EVENT_VENUE_REQUIRED,
  }),
  startDate: Joi.date().iso().required().messages({
    'date.base': MESSAGES.EVENT_START_DATE_REQUIRED,
    'any.required': MESSAGES.EVENT_START_DATE_REQUIRED,
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.base': MESSAGES.EVENT_END_DATE_REQUIRED,
    'date.greater': MESSAGES.END_DATE_AFTER_START,
    'any.required': MESSAGES.EVENT_END_DATE_REQUIRED,
  }),
});

const updateEventSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim(),
  venue: Joi.string().trim(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  status: Joi.string()
    .valid(EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED)
    .messages({
      'any.only': MESSAGES.EVENT_CANCEL_VIA_DELETE,
    }),
})
  .min(1)
  .messages({
    'object.min': MESSAGES.AT_LEAST_ONE_FIELD_REQUIRED,
  });

module.exports = { createEventSchema, updateEventSchema };
