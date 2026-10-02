const express = require('express');
const request = require('supertest');
const securityHeaders = require('../src/middlewares/securityMiddleware');

const app = express();
app.use(securityHeaders);

app.get('/test', (req, res) => res.status(200).send('OK'));

describe('Security Middleware Extra', () => {
  it('permite request quando headers obrigatórios existem', async () => {
    const res = await request(app)
      .get('/test')
      .set('x-api-key', 'test-key')
      .set('authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
  });
});
