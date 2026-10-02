const request = require('supertest');
const express = require('express');
const mockUser = require('./helpers/mockUser');

describe('Full Auth Flow', () => {
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

  it('should refresh token with valid user', async () => {
    const res = await request(app).post('/auth/refresh');
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('novo-token');
  });
});
