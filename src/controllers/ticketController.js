const ticketService = require('../services/ticketService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');

const createTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.createTicket(req.params.id, req.body);
  sendSuccess(res, ticket, MESSAGES.TICKET_CREATED, HTTP.CREATED);
});

const listTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.listTicketsByEvent(req.params.id, req.user.role);
  sendSuccess(res, tickets);
});

module.exports = { createTicket, listTickets };
