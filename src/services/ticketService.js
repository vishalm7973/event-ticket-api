const Ticket = require('../models/Ticket');
const eventService = require('./eventService');
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

module.exports = { createTicket, listTicketsByEvent };
