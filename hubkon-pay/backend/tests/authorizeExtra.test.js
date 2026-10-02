const request = require('supertest');
const express = require('express');
const authorize = require('../src/middlewares/authorize');
const mockUser = require('./helpers/mockUser');

describe('Authorize Middleware Extra', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get(
      '/allowed',
      mockUser('admin'), // admin tem permissão 'create'
      authorize('create'),
      (req, res) => res.status(200).json({ message: 'Acesso permitido' })
    );

    app.get(
      '/denied',
      mockUser('user'), // user não tem 'create'
      authorize('create'),
      (req, res) => res.status(200).json({ message: 'Acesso permitido' })
    );
  });

  it('permite quando usuário tem permissão', async () => {
    const res = await request(app).get('/allowed');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Acesso permitido');
  });

  it('bloqueia usuário sem permissão', async () => {
    const res = await request(app).get('/denied');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Acesso negado');
  });
});
