const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose.connect("mongodb://127.0.0.1:27017/hubkon-pay");

const User = require("./src/models/userModel");

(async () => {
  const hash = bcrypt.hashSync("12345678", 10);
  await User.updateOne(
    { email: "admin@hubkon.io" },
    { $set: { senha: hash } }
  );
  console.log("Senha atualizada com hash bcrypt!");
  mongoose.disconnect();
})();