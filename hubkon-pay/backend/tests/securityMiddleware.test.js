// backend/tests/securityMiddleware.test.js
const request = require('supertest');
const express = require('express');

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  app.get('/test', (req, res) => res.status(200).send('ok'));

  return app;
};

describe('Security Middleware', () => {
  let app;
  beforeAll(() => { app = createTestApp(); });

  it('should allow request with correct headers', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('ok');
  });
});
