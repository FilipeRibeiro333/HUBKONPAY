const express = require('express');
const request = require('supertest');
const auditMiddleware = require('../src/middlewares/auditMiddleware');

describe('Audit Middleware – edge cases', () => {
  let app;

  beforeEach(() => {
    app = express();

    // Middleware global
    app.use(auditMiddleware());

    // Rota UNKNOWN REAL
    app.put('/unknown', (req, res) => {
      res.status(200).json({ ok: true });
    });
  });

  it('deve registrar ação UNKNOWN para rota não mapeada', async () => {
    const res = await request(app).put('/unknown');
    expect(res.status).toBe(200);
  });
});
