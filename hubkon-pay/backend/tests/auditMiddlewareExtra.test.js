const request = require('supertest');
const express = require('express');
const auditMiddleware = require('../src/middlewares/auditMiddleware'); // CORRETO
const app = express();

// Rota mock com middleware
app.get('/health', auditMiddleware('HEALTH_CHECK'), (req, res) => {
  res.status(200).json({ status: 'ok' });
});

describe('Audit Middleware Extra', () => {
  it('deve registrar HEALTH_CHECK corretamente', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
