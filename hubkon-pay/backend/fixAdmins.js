import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/userModel.js'; // Confirme se o caminho está correto
import dotenv from 'dotenv';
dotenv.config();

async function fixAdmins() {
  try {
    // Conecta ao banco hubkon_beta explicitamente para não haver erro
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hubkon_beta';
    await mongoose.connect(MONGO_URI);
    console.log(`🚀 Conectado ao banco: ${mongoose.connection.name}`);

    const admins = [
      "admin1@hubkon.com",
      "admin2@hubkon.com",
      "admin3@hubkon.com",
      "admin4@hubkon.com"
    ];

    const defaultPassword = "SuaSenhaSegura123";

    for (const email of admins) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      const result = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          $set: { 
            password: hashedPassword, 
            role: "superadmin", 
            isSuperAdmin: true,
            status: "active",
            // Vínculo com a empresa MASTER que vimos no seu banco
            company_id: new mongoose.Types.ObjectId('69f7ada159e0739d733ecb9d')
          } 
        },
        { new: true, upsert: true } // O segredo: se não existir, ele CRIA.
      );

      if (result) {
        console.log(`✅ SUCESSO: ${email} está pronto para o combate.`);
      }
    }

    console.log("\n✨ TODOS OS SUPERADMINS FORAM SINCRONIZADOS!");
    console.log("Use a senha: SuaSenhaSegura123");
    process.exit();
  } catch (err) {
    console.error("🚨 ERRO NO SCRIPT:", err);
    process.exit(1);
  }
}

fixAdmins();
