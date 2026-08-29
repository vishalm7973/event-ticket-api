const {
  app,
  request,
  connectTestDB,
  clearDB,
  closeTestDB,
  registerAndLogin,
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

describe('Auth', () => {
  const validRegister = {
    firstName: 'Vishal',
    lastName: 'Demo',
    email: 'vishal@example.com',
    password: 'Password1',
  };

  test('register success', async () => {
    const res = await request(app).post('/api/auth/register').send(validRegister);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(validRegister.email);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  test('register duplicate email → 409', async () => {
    await request(app).post('/api/auth/register').send(validRegister);
    const res = await request(app).post('/api/auth/register').send(validRegister);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('register invalid input → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Vishal',
      email: 'bad-email',
      password: 'short',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('login success', async () => {
    await request(app).post('/api/auth/register').send(validRegister);
    const res = await request(app).post('/api/auth/login').send({
      email: validRegister.email,
      password: validRegister.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('login wrong password → 401', async () => {
    await request(app).post('/api/auth/register').send(validRegister);
    const res = await request(app).post('/api/auth/login').send({
      email: validRegister.email,
      password: 'WrongPass1',
    });

    expect(res.status).toBe(401);
  });

  test('protected route without token → 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  test('logout invalidates access token', async () => {
    const { accessToken } = await registerAndLogin({ email: 'logout@example.com' });

    const meBefore = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(meBefore.status).toBe(200);

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(logoutRes.status).toBe(200);

    const meAfter = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(meAfter.status).toBe(401);
  });

  test('refresh token rotation works', async () => {
    const { refreshToken } = await registerAndLogin({ email: 'refresh@example.com' });

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(refreshToken);

    const reuseOld = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(reuseOld.status).toBe(401);
  });
});
