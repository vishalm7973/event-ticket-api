const bookingService = require('../services/bookingService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  sendSuccess(res, booking, MESSAGES.BOOKING_CREATED, HTTP.CREATED);
});

module.exports = { createBooking };
