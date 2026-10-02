const express = require('express');
const request = require('supertest');
const can = require('../src/middlewares/can');

const app = express();

function mockUser(role) {
  return (req, res, next) => {
    req.user = { role };
    next();
  };
}

app.get('/admin', mockUser('admin'), can('admin'), (req, res) => {
  res.status(200).json({ message: 'Acesso permitido' });
});

app.get('/user', mockUser('user'), can('admin'), (req, res) => {
  res.status(200).json({ message: 'Acesso permitido' });
});

describe('Can Middleware', () => {
  it('permite admin', async () => {
    const res = await request(app).get('/admin');
    expect(res.statusCode).toBe(200);
  });

  it('bloqueia usuário comum', async () => {
    const res = await request(app).get('/user');
    expect(res.statusCode).toBe(403);
  });
});

