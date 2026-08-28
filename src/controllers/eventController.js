const eventService = require('../services/eventService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user._id);
  sendSuccess(res, event, MESSAGES.EVENT_CREATED, HTTP.CREATED);
});

const listEvents = asyncHandler(async (req, res) => {
  const result = await eventService.listEvents(req.query);
  sendSuccess(res, result);
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getPublishedEventById(req.params.id);
  sendSuccess(res, event);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  sendSuccess(res, event, MESSAGES.EVENT_UPDATED);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await eventService.cancelEvent(req.params.id);
  sendSuccess(res, event, MESSAGES.EVENT_CANCELLED);
});

module.exports = { createEvent, listEvents, getEventById, updateEvent, deleteEvent };
