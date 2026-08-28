const express = require('express');
const eventController = require('../controllers/eventController');
const ticketController = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createEventSchema, updateEventSchema } = require('../validators/eventValidator');
const { createTicketSchema } = require('../validators/ticketValidator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize(ROLES.USER, ROLES.ADMIN),
  eventController.listEvents
);

router.get(
  '/:id/tickets',
  authenticate,
  authorize(ROLES.USER, ROLES.ADMIN),
  ticketController.listTickets
);

router.post(
  '/:id/tickets',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createTicketSchema),
  ticketController.createTicket
);

router.get(
  '/:id',
  authenticate,
  authorize(ROLES.USER, ROLES.ADMIN),
  eventController.getEventById
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createEventSchema),
  eventController.createEvent
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  eventController.deleteEvent
);

module.exports = router;
