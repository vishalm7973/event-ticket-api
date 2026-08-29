process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const ROLES = require('../src/constants/roles');
const EVENT_STATUS = require('../src/constants/eventStatus');

let mongoServer;

const connectTestDB = async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
    binary: { version: '7.0.14' },
  });
  await mongoServer.waitUntilRunning();
  await mongoose.connect(mongoServer.getUri('event-ticket-test'));
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

const createUser = async ({
  firstName = 'Test',
  lastName = 'User',
  email,
  password = 'Password1',
  role = ROLES.USER,
} = {}) => {
  const user = new User({ firstName, lastName, email, role });
  user.password = password;
  await user.save();
  return user;
};

const registerAndLogin = async (overrides = {}) => {
  const payload = {
    firstName: 'Test',
    lastName: 'User',
    email: overrides.email || `user_${Date.now()}@example.com`,
    password: overrides.password || 'Password1',
    ...overrides,
  };

  await request(app).post('/api/auth/register').send(payload);

  const loginRes = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: payload.password,
  });

  return {
    ...loginRes.body.data,
    email: payload.email,
    password: payload.password,
  };
};

const loginAsAdmin = async () => {
  const email = `admin_${Date.now()}@example.com`;
  await createUser({
    firstName: 'Admin',
    lastName: 'User',
    email,
    password: 'AdminPass1',
    role: ROLES.ADMIN,
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email,
    password: 'AdminPass1',
  });

  return loginRes.body.data;
};

const createPublishedEventWithTicket = async (adminToken, ticketOverrides = {}) => {
  const createRes = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Test Concert',
      description: 'A test event',
      venue: 'Test Hall',
      startDate: '2026-10-01T18:00:00.000Z',
      endDate: '2026-10-01T21:00:00.000Z',
    });

  const eventId = createRes.body.data._id;

  await request(app)
    .patch(`/api/events/${eventId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: EVENT_STATUS.PUBLISHED });

  const ticketRes = await request(app)
    .post(`/api/events/${eventId}/tickets`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'General',
      price: 100,
      totalQuantity: ticketOverrides.totalQuantity || 10,
    });

  return {
    eventId,
    ticketId: ticketRes.body.data._id,
    ticket: ticketRes.body.data,
  };
};

module.exports = {
  app,
  request,
  connectTestDB,
  clearDB,
  closeTestDB,
  createUser,
  registerAndLogin,
  loginAsAdmin,
  createPublishedEventWithTicket,
  ROLES,
  EVENT_STATUS,
};
