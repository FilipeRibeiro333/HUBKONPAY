// Mock global do User
jest.mock('../src/models/userModel', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

// Mock global do RefreshToken
jest.mock('../src/models/refreshTokenModel', () => ({
  create: jest.fn(),
  deleteOne: jest.fn(),
  findOne: jest.fn(),
}));
