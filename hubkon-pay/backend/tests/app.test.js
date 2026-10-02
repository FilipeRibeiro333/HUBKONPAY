const request = require('supertest');
const express = require('express');
const authorize = require('../src/middlewares/authorize');
const mockUser = require('./helpers/mockUser');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get(
    '/protected',
    mockUser('admin'), // admin tem permissão 'create'
    authorize('create'),
    (req, res) => res.status(200).json({ message: 'Acesso permitido' })
  );

  return app;
}

describe('Protected routes', () => {
  it('acessa rota com permissão correta', async () => {
    const app = createTestApp();
    const res = await request(app).get('/protected');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Acesso permitido');
  });
});
