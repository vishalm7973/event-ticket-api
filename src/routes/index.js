const express = require('express');
const { sendSuccess } = require('../utils/apiResponse');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  sendSuccess(res, { message: 'Event Ticket API' });
});

router.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' });
});

router.use('/auth', authRoutes);

module.exports = router;
