const crypto = require("crypto");

function generateWalletAddress() {
  return "HUB" + crypto.randomBytes(20).toString("hex");
}

module.exports = generateWalletAddress;