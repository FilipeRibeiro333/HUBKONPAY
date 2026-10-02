const request = require('supertest');
const express = require('express');
const authorize = require('../src/middlewares/authorize');
const mockUser = require('./helpers/mockUser');

describe('authorize middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get(
      '/create-user',
      mockUser('admin'), // admin pode 'create'
      authorize('create'),
      (req, res) => res.status(200).json({ message: 'Usuário criado' })
    );

    app.get(
      '/create-user-denied',
      mockUser('user'), // user não pode 'create'
      authorize('create'),
      (req, res) => res.status(200).json({ message: 'Usuário criado' })
    );
  });

  it('permite usuário com permissão correta', async () => {
    const res = await request(app).get('/create-user');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Usuário criado');
  });

  it('bloqueia usuário sem permissão', async () => {
    const res = await request(app).get('/create-user-denied');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Acesso negado');
  });

  it('retorna 403 se req.user não definido', async () => {
    app.get('/no-user', authorize('create'), (req, res) => res.status(200).json({}));
    const res = await request(app).get('/no-user');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Usuário não definido');
  });
});


