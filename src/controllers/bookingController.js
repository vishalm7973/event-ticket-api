const bookingService = require('../services/bookingService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user._id, req.body);
  sendSuccess(res, booking, MESSAGES.BOOKING_CREATED, HTTP.CREATED);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getMyBookings(req.user._id, req.query);
  sendSuccess(res, result);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.user._id, req.params.id);
  sendSuccess(res, booking, MESSAGES.BOOKING_CANCELLED);
});

const listAllBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listAllBookings(req.query);
  sendSuccess(res, result);
});

module.exports = { createBooking, getMyBookings, cancelBooking, listAllBookings };
