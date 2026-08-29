const {
  app,
  request,
  connectTestDB,
  clearDB,
  closeTestDB,
  registerAndLogin,
  loginAsAdmin,
  createPublishedEventWithTicket,
  EVENT_STATUS,
} = require('./helpers');
const Ticket = require('../src/models/Ticket');
const Event = require('../src/models/Event');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Bookings', () => {
  test('booking success decrements inventory', async () => {
    const admin = await loginAsAdmin();
    const user = await registerAndLogin({ email: 'booker@example.com' });
    const { eventId, ticketId } = await createPublishedEventWithTicket(admin.accessToken, {
      totalQuantity: 10,
    });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ eventId, ticketId, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.data.quantity).toBe(2);
    expect(res.body.data.totalAmount).toBe(200);

    const ticket = await Ticket.findById(ticketId);
    expect(ticket.availableQuantity).toBe(8);
  });

  test('booking insufficient tickets → 400', async () => {
    const admin = await loginAsAdmin();
    const user = await registerAndLogin({ email: 'lowstock@example.com' });
    const { eventId, ticketId } = await createPublishedEventWithTicket(admin.accessToken, {
      totalQuantity: 2,
    });

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ eventId, ticketId, quantity: 5 });

    expect(res.status).toBe(400);
  });

  test('cancel own booking success', async () => {
    const admin = await loginAsAdmin();
    const user = await registerAndLogin({ email: 'cancelown@example.com' });
    const { eventId, ticketId } = await createPublishedEventWithTicket(admin.accessToken, {
      totalQuantity: 10,
    });

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ eventId, ticketId, quantity: 3 });

    const bookingId = bookRes.body.data._id;

    const cancelRes = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${user.accessToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    const ticket = await Ticket.findById(ticketId);
    expect(ticket.availableQuantity).toBe(10);
  });

  test("cancel another user's booking → 403", async () => {
    const admin = await loginAsAdmin();
    const owner = await registerAndLogin({ email: 'owner@example.com' });
    const other = await registerAndLogin({ email: 'other@example.com' });
    const { eventId, ticketId } = await createPublishedEventWithTicket(admin.accessToken);

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ eventId, ticketId, quantity: 1 });

    const cancelRes = await request(app)
      .patch(`/api/bookings/${bookRes.body.data._id}/cancel`)
      .set('Authorization', `Bearer ${other.accessToken}`);

    expect(cancelRes.status).toBe(403);
  });

  test('cancelled event cannot receive new bookings', async () => {
    const admin = await loginAsAdmin();
    const user = await registerAndLogin({ email: 'blocked@example.com' });
    const { eventId, ticketId } = await createPublishedEventWithTicket(admin.accessToken);

    await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);

    const event = await Event.findById(eventId);
    expect(event.status).toBe(EVENT_STATUS.CANCELLED);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ eventId, ticketId, quantity: 1 });

    expect(res.status).toBe(400);
  });

  test('my bookings returns paginated result', async () => {
    const admin = await loginAsAdmin();
    const user = await registerAndLogin({ email: 'paginated@example.com' });
    const { eventId, ticketId } = await createPublishedEventWithTicket(admin.accessToken, {
      totalQuantity: 20,
    });

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ eventId, ticketId, quantity: 1 });

    const res = await request(app)
      .get('/api/bookings/me?page=1&limit=5')
      .set('Authorization', `Bearer ${user.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.bookings).toHaveLength(1);
    expect(res.body.data.pagination).toEqual({
      page: 1,
      limit: 5,
      total: 1,
      pages: 1,
    });
  });

  test('admin list bookings returns paginated result', async () => {
    const admin = await loginAsAdmin();
    const user = await registerAndLogin({ email: 'adminpage@example.com' });
    const { eventId, ticketId } = await createPublishedEventWithTicket(admin.accessToken);

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ eventId, ticketId, quantity: 1 });

    const res = await request(app)
      .get('/api/admin/bookings?page=1&limit=10')
      .set('Authorization', `Bearer ${admin.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.bookings.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(10);
    expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(1);
  });
});
