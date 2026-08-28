const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Event Ticket API' });
});

module.exports = router;
