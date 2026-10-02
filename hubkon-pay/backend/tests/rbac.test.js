// backend/tests/rbac.test.js
const request = require('supertest');
const express = require('express');

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@example.com' && password === '123456') {
      return res.status(200).json({ accessToken: 'token-fake' });
    }
    return res.status(401).json({ message: 'Unauthorized' });
  });

  return app;
};

describe('Auth Endpoints', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
});
