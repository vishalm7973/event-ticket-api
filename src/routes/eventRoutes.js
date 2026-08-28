const express = require('express');
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createEventSchema } = require('../validators/eventValidator');
const ROLES = require('../constants/roles');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createEventSchema),
  eventController.createEvent
);

module.exports = router;
