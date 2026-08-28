const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createBookingSchema } = require('../validators/bookingValidator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.USER),
  validate(createBookingSchema),
  bookingController.createBooking
);

module.exports = router;
