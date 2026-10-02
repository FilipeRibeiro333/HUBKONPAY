require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Conectado ao MongoDB");

    const novaSenha = await bcrypt.hash("123456", 12);

    await mongoose.connection.db.collection("users").updateOne(
      { email: "normal@hubkon.com" },
      { $set: { senha: novaSenha } }
    );

    console.log("🔐 Senha redefinida para: 123456");
    process.exit();
  })
  .catch(err => console.error(err));