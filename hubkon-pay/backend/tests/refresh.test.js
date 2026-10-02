const request = require('supertest');
const express = require('express');
const mockUser = require('./helpers/mockUser');

describe('Refresh token', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.post(
      '/auth/refresh',
      mockUser('admin'),
      (req, res) => res.status(200).json({ accessToken: 'novo-token' })
    );
  });

  it('deve permitir refresh com token válido', async () => {
    const res = await request(app).post('/auth/refresh');
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('novo-token');
  });
});
