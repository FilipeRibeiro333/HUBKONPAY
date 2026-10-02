// tests/helpers/mockUser.js
module.exports = function mockUser(role) {
  return (req, res, next) => {
    req.user = { role };
    next();
  };
};
