import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function recover() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 Restaurando acesso da empresa...");

    const email = "admin2@hubkon.com";
    const novaSenha = "1234567890"; // A senha que tu queres usar
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        $set: { 
          password: hashedPassword,
          role: "admin" // Mantém como admin da empresa, se preferires
        } 
      },
      { new: true }
    );

    if (user) {
      console.log(`✅ SUCESSO: A senha de ${email} foi resetada para: ${novaSenha}`);
    } else {
      console.log("❌ ERRO: Utilizador não encontrado. Verifica se estás no banco certo no .env");
    }
    process.exit();
  } catch (err) {
    console.error("🚨 Erro:", err);
    process.exit(1);
  }
}

recover();
