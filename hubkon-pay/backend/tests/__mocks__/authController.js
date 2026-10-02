const RefreshToken = {
  create: jest.fn(),
  findOne: jest.fn().mockResolvedValue({ token: 'fake-refresh-token', userId: '123' }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
};

const jwt = {
  sign: jest.fn(() => 'mocked-token'),
  verify: jest.fn(() => ({ id: '123', roles: ['user'] })),
};

module.exports = {
  RefreshToken,
  jwt
};
