const RefreshToken = require('../models/RefreshTokenModel');

const revokeToken = async (token) => {
  return RefreshToken.findOneAndUpdate(
    { token },
    { revoked: true }
  );
};

module.exports = {
  revokeToken,
};
