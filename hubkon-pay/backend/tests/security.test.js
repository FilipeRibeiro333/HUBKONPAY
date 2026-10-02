const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());

const securityMiddleware = require('../src/middlewares/securityMiddleware');

// Rota de teste protegida pelo middleware
app.get('/test', securityMiddleware, (req, res) => {
  res.status(200).send('ok');
});

describe('Security Middleware', () => {
  it('should allow request with correct headers', async () => {
    const res = await request(app)
      .get('/test')
      .set('x-api-key', 'SECRET_KEY')           // ✅ Header obrigatório
      .set('authorization', 'Bearer testtoken'); // ✅ Header obrigatório

    expect(res.statusCode).toBe(200);
  });
});
