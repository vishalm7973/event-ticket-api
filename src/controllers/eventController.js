const eventService = require('../services/eventService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user._id);
  sendSuccess(res, event, MESSAGES.EVENT_CREATED, HTTP.CREATED);
});

module.exports = { createEvent };
