// backend/tests/authorize.test.js
const request = require('supertest');
const express = require('express');
const authorize = require('../src/middlewares/authorize');

const app = express();
app.use(express.json());

app.get(
  '/secure',
  (req, res, next) => {
    req.user = { permissions: ['create_user'] };
    next();
  },
  authorize(['create_user']),
  (req, res) => res.status(200).json({ ok: true })
);

app.get(
  '/forbidden',
  (req, res, next) => {
    req.user = { permissions: [] };
    next();
  },
  authorize(['create_user']),
  (req, res) => res.status(200).json({ ok: true })
);

describe('Authorize Middleware', () => {
  it('permite acesso com permissão correta', async () => {
    const res = await request(app).get('/secure');
    expect(res.statusCode).toBe(200);
  });

  it('bloqueia acesso sem permissão', async () => {
    const res = await request(app).get('/forbidden');
    expect(res.statusCode).toBe(403);
  });
});
