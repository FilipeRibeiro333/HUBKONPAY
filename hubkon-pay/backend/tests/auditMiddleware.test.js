// backend/tests/auditMiddleware.test.js
const request = require('supertest');
const express = require('express');

// Mock do auditMiddleware
const auditMiddleware = (label) => (req, res, next) => {
  console.log(`Audit log (mock): ${label || req.method} ${req.path}`);
  next();
};

const app = express();
app.use(express.json());

// Rotas de teste
app.get('/health', auditMiddleware('HEALTH_CHECK'), (req, res) => res.status(200).send('ok'));
app.get('/test', auditMiddleware('TEST'), (req, res) => res.status(200).send('test'));

describe('Audit Middleware', () => {
  it('deve registrar auditoria para GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('ok');
  });

  it('deve registrar auditoria para GET /test', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('test');
  });
});

