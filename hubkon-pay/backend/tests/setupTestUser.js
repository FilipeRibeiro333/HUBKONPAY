const mongoose = require('mongoose');
const User = require('../src/models/userModel');

beforeAll(async () => {
  await User.create({ email: 'user@test.com', password: '123456', role: 'user' });
  await User.create({ email: 'admin@test.com', password: '123456', role: 'admin' });
});
