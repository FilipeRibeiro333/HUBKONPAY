module.exports = {
  sign: jest.fn().mockReturnValue('mocked-token'),
  verify: jest.fn().mockReturnValue({ id: '123', roles: ['user'] }),
};
