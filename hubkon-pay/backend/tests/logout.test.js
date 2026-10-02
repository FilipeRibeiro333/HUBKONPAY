const request = require('supertest');
const express = require('express');
const mockUser = require('./helpers/mockUser');

describe('Logout Endpoint', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.post(
      '/auth/logout',
      mockUser('admin'),
      (req, res) => res.status(200).json({ message: 'Logout realizado com sucesso' })
    );
  });

  it('should logout successfully', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout realizado com sucesso');
  });
});
