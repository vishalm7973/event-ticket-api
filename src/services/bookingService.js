const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const AppError = require('../utils/AppError');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const EVENT_STATUS = require('../constants/eventStatus');
const BOOKING_STATUS = require('../constants/bookingStatus');

const createBooking = async (userId, data) => {
  const { eventId, ticketId, quantity } = data;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const event = await Event.findOne({
      _id: eventId,
      status: EVENT_STATUS.PUBLISHED,
    }).session(session);

    if (!event) {
      throw new AppError(MESSAGES.EVENT_NOT_BOOKABLE, HTTP.BAD_REQUEST);
    }

    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: ticketId,
        eventId,
        availableQuantity: { $gte: quantity },
      },
      { $inc: { availableQuantity: -quantity } },
      { new: true, session }
    );

    if (!ticket) {
      throw new AppError(MESSAGES.INSUFFICIENT_TICKETS, HTTP.BAD_REQUEST);
    }

    const totalAmount = ticket.price * quantity;

    const [booking] = await Booking.create(
      [
        {
          userId,
          eventId,
          ticketId,
          quantity,
          totalAmount,
          status: BOOKING_STATUS.CONFIRMED,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getMyBookings = async (userId) => {
  return Booking.find({ userId })
    .populate('eventId')
    .populate('ticketId')
    .sort({ createdAt: -1 });
};

const cancelBooking = async (userId, bookingId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      throw new AppError(MESSAGES.BOOKING_NOT_FOUND, HTTP.NOT_FOUND);
    }

    if (booking.userId.toString() !== userId.toString()) {
      throw new AppError(MESSAGES.NOT_AUTHORIZED, HTTP.FORBIDDEN);
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new AppError(MESSAGES.BOOKING_ALREADY_CANCELLED, HTTP.BAD_REQUEST);
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    await booking.save({ session });

    const ticket = await Ticket.findByIdAndUpdate(
      booking.ticketId,
      { $inc: { availableQuantity: booking.quantity } },
      { new: true, session }
    );

    if (!ticket) {
      throw new AppError(MESSAGES.TICKET_NOT_FOUND, HTTP.NOT_FOUND);
    }

    await session.commitTransaction();
    return booking;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };
