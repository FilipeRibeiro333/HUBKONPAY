require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Ajuste conforme sua versão do Mongoose
      serverSelectionTimeoutMS: 5000, // Timeout de 5s
    });
    console.log("✅ Conexão com MongoDB estabelecida com sucesso!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao conectar com MongoDB:", err.message);
    process.exit(1);
  }
}

testConnection();
