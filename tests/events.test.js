const {
  app,
  request,
  connectTestDB,
  clearDB,
  closeTestDB,
  registerAndLogin,
  loginAsAdmin,
  EVENT_STATUS,
} = require('./helpers');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Events', () => {
  const eventPayload = {
    title: 'Jazz Night',
    description: 'Live jazz performance',
    venue: 'Blue Note',
    startDate: '2026-11-01T19:00:00.000Z',
    endDate: '2026-11-01T22:00:00.000Z',
  };

  test('admin create event success', async () => {
    const { accessToken } = await loginAsAdmin();

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(eventPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe(eventPayload.title);
    expect(res.body.data.status).toBe(EVENT_STATUS.DRAFT);
  });

  test('non-admin create event → 403', async () => {
    const { accessToken } = await registerAndLogin({ email: 'normal@example.com' });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(eventPayload);

    expect(res.status).toBe(403);
  });

  test('publish already published event → 400', async () => {
    const { accessToken } = await loginAsAdmin();

    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(eventPayload);

    const eventId = created.body.data._id;

    await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: EVENT_STATUS.PUBLISHED });

    const res = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: EVENT_STATUS.PUBLISHED });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already published/i);
  });

  test('ticket create on cancelled event → 400', async () => {
    const { accessToken } = await loginAsAdmin();

    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(eventPayload);

    const eventId = created.body.data._id;

    await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app)
      .post(`/api/events/${eventId}/tickets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'GA', price: 100, totalQuantity: 50 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cancelled/i);
  });

  test('cancelled event cannot be set back to DRAFT or PUBLISHED → 400', async () => {
    const { accessToken } = await loginAsAdmin();

    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(eventPayload);

    const eventId = created.body.data._id;

    await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const toDraft = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: EVENT_STATUS.DRAFT });

    const toPublished = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: EVENT_STATUS.PUBLISHED });

    expect(toDraft.status).toBe(400);
    expect(toDraft.body.message).toMatch(/cancelled/i);
    expect(toPublished.status).toBe(400);
    expect(toPublished.body.message).toMatch(/cancelled/i);
  });
});
