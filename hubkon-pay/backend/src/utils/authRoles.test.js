const authRoles = require('./authRoles');

describe('authRoles utils', () => {
  it('should have roles defined', () => {
    expect(Object.keys(authRoles)).toEqual(
      expect.arrayContaining(['admin', 'user', 'guest'])
    );
  });
});
