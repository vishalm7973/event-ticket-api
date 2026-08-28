const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const HTTP = require('../constants/httpStatus');
const MESSAGES = require('../constants/messages');
const EVENT_STATUS = require('../constants/eventStatus');

const createEvent = async (data, userId) => {
  const event = await Event.create({
    ...data,
    status: EVENT_STATUS.DRAFT,
    createdBy: userId,
  });

  return event;
};

const listEvents = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { status: EVENT_STATUS.PUBLISHED };

  const [events, total] = await Promise.all([
    Event.find(filter).sort({ startDate: 1 }).skip(skip).limit(limit),
    Event.countDocuments(filter),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 0,
    },
  };
};

const getPublishedEventById = async (id) => {
  const event = await Event.findOne({
    _id: id,
    status: EVENT_STATUS.PUBLISHED,
  });

  if (!event) {
    throw new AppError(MESSAGES.EVENT_NOT_FOUND, HTTP.NOT_FOUND);
  }

  return event;
};

const getEventById = async (id) => {
  const event = await Event.findById(id);

  if (!event) {
    throw new AppError(MESSAGES.EVENT_NOT_FOUND, HTTP.NOT_FOUND);
  }

  return event;
};

const updateEvent = async (id, data) => {
  const event = await getEventById(id);

  const startDate = data.startDate ?? event.startDate;
  const endDate = data.endDate ?? event.endDate;

  if (endDate <= startDate) {
    throw new AppError(MESSAGES.END_DATE_AFTER_START, HTTP.BAD_REQUEST);
  }

  Object.assign(event, data);
  await event.save();

  return event;
};

const cancelEvent = async (id) => {
  const event = await getEventById(id);
  event.status = EVENT_STATUS.CANCELLED;
  await event.save();

  return event;
};

module.exports = {
  createEvent,
  listEvents,
  getPublishedEventById,
  updateEvent,
  cancelEvent,
};
