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
});
