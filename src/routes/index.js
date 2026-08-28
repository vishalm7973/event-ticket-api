const express = require('express');
const { sendSuccess } = require('../utils/apiResponse');

const router = express.Router();

router.get('/', (req, res) => {
  sendSuccess(res, { message: 'Event Ticket API' });
});

router.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' });
});

module.exports = router;
