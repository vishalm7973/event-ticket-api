const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const ROLES = require('../constants/roles');

const router = express.Router();

router.get(
  '/bookings',
  authenticate,
  authorize(ROLES.ADMIN),
  bookingController.listAllBookings
);

module.exports = router;
