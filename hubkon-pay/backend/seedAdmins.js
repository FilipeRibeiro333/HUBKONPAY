import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/userModel.js'; // Verifique se o caminho do seu model está correto
import dotenv from 'dotenv';

dotenv.config();

async function gravarNoBanco() {
  try {
    // Conecta ao banco usando a sua variável do .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 Conectado ao MongoDB. Iniciando gravação...");

    const superAdmins = [
      { name: "Master", email: "master@hubkon.com", password: "MasterPassword123!" },
      { name: "Geral 01", email: "admin.geral1@hubkon.com", password: "SecureAdmin123!" },
      { name: "Geral 02", email: "admin.geral2@hubkon.com", password: "SecureAdmin456!" },
      { name: "Auditores", email: "audit@hubkon.com", password: "AuditPassword789!" }
    ];

    for (const admin of superAdmins) {
      // Encripta a senha antes de gravar (Obrigatório para o login funcionar)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);

      // O 'upsert' garante que: se não existir, cria. Se existir, atualiza.
      await User.findOneAndUpdate(
        { email: admin.email },
        { 
          name: admin.name,
          password: hashedPassword,
          role: "superadmin",  // Nível de acesso para as rotas laranja
          isSuperAdmin: true,  // Flag para passar por qualquer bloqueio de plano
          plan: "enterprise"   // Garante que o Admin tenha todos os recursos
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Gravado com sucesso: ${admin.email}`);
    }

    console.log("\n✨ Base de dados pronta. Tente logar com master@hubkon.com agora.");
    process.exit();
  } catch (err) {
    console.error("🚨 Erro ao gravar no banco:", err);
    process.exit(1);
  }
}

gravarNoBanco();
