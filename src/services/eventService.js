const Event = require('../models/Event');
const EVENT_STATUS = require('../constants/eventStatus');

const createEvent = async (data, userId) => {
  const event = await Event.create({
    ...data,
    status: EVENT_STATUS.DRAFT,
    createdBy: userId,
  });

  return event;
};

module.exports = { createEvent };
