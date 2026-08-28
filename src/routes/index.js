const express = require('express');
const { sendSuccess } = require('../utils/apiResponse');
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const bookingRoutes = require('./bookingRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  sendSuccess(res, { message: 'Event Ticket API' });
});

router.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
