const Ticket = require('../models/Ticket');
const eventService = require('./eventService');
const AppError = require('../utils/AppError');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const ROLES = require('../constants/roles');

const createTicket = async (eventId, data) => {
  await eventService.getEventById(eventId);

  const ticket = await Ticket.create({
    eventId,
    name: data.name,
    price: data.price,
    totalQuantity: data.totalQuantity,
    availableQuantity: data.totalQuantity,
  });

  return ticket;
};

const listTicketsByEvent = async (eventId, role) => {
  if (role === ROLES.ADMIN) {
    await eventService.getEventById(eventId);
  } else {
    await eventService.getPublishedEventById(eventId);
  }

  return Ticket.find({ eventId }).sort({ price: 1 });
};

const updateTicketAvailability = async (eventId, ticketId, data) => {
  await eventService.getEventById(eventId);

  let ticket;

  if (data.add) {
    // venue grew — increase capacity and unsold seats together
    ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, eventId },
      {
        $inc: {
          totalQuantity: data.add,
          availableQuantity: data.add,
        },
      },
      { new: true }
    );
  } else {
    // capacity cut — only remove unsold seats
    ticket = await Ticket.findOneAndUpdate(
      {
        _id: ticketId,
        eventId,
        availableQuantity: { $gte: data.remove },
        totalQuantity: { $gt: data.remove },
      },
      {
        $inc: {
          totalQuantity: -data.remove,
          availableQuantity: -data.remove,
        },
      },
      { new: true }
    );

    if (!ticket) {
      const existing = await Ticket.findOne({ _id: ticketId, eventId });

      if (!existing) {
        throw new AppError(MESSAGES.TICKET_NOT_FOUND, HTTP.NOT_FOUND);
      }

      throw new AppError(MESSAGES.TICKET_NOT_ENOUGH_UNSOLD, HTTP.BAD_REQUEST);
    }

    return ticket;
  }

  if (!ticket) {
    throw new AppError(MESSAGES.TICKET_NOT_FOUND, HTTP.NOT_FOUND);
  }

  return ticket;
};

module.exports = { createTicket, listTicketsByEvent, updateTicketAvailability };
