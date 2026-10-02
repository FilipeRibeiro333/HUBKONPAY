// tests/authorizeEdge.test.js
const express = require('express');
const request = require('supertest');
const authorize = require('../src/middlewares/authorize');

const app = express();

app.get(
  '/edge',
  (req, res, next) => {
    req.user = { permissions: [] };
    next();
  },
  authorize(),
  (req, res) => res.sendStatus(200)
);

describe('Authorize – edge case', () => {
  it('bloqueia quando permissão não é definida', async () => {
    const res = await request(app).get('/edge');
    expect(res.status).toBe(403);
  });
});
