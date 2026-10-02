// tests/securityMissingHeaders.test.js

const request = require('supertest');
const express = require('express');
const securityMiddleware = require('../src/middlewares/securityMiddleware');

describe('Security Middleware – headers ausentes', () => {
  const app = express();
  app.use(securityMiddleware);

  app.get('/test', (req, res) => {
    res.status(200).json({ ok: true });
  });

  it('bloqueia request sem headers obrigatórios', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(400);
  });
});
