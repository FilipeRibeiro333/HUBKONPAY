// createTestUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/userModel');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    const email = process.env.USER_EMAIL;
    const senha = process.env.USER_PASSWORD;
    const nome = "Usuário Teste";

    let user = await User.findOne({ email });

    if (user) {
      console.log(`⚠️ Usuário já existe: ${email}`);
    } else {
      user = await User.create({ nome, email, senha, role: "user" });
      console.log(`✅ Usuário criado: ${email}`);
    }

    await mongoose.connection.close();
    console.log("🔒 Conexão com MongoDB fechada");
  } catch (err) {
    console.error("💥 Erro ao criar usuário:", err);
  }
}

main();