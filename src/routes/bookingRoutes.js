const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createBookingSchema } = require('../validators/bookingValidator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.get(
  '/me',
  authenticate,
  authorize(ROLES.USER),
  bookingController.getMyBookings
);

router.post(
  '/',
  authenticate,
  authorize(ROLES.USER),
  validate(createBookingSchema),
  bookingController.createBooking
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize(ROLES.USER),
  bookingController.cancelBooking
);

module.exports = router;
