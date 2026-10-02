const express = require('express');
const request = require('supertest');
const auditMiddleware = require('../src/middlewares/auditMiddleware'); // CORRETO
const app = express();

app.get('/health', auditMiddleware('HEALTH_CHECK'), (req, res) => {
  res.status(200).json({ status: 'ok' });
});

describe('Audit Middleware', () => {
  it('deve registrar HEALTH_CHECK /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
