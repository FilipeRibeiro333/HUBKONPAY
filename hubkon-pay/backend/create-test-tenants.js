import mongoose from 'mongoose';
import Company from './src/models/companyModel.js';
import User from './src/models/userModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createTenants() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`🚀 Conectado ao banco: ${mongoose.connection.name}`);

    const testCompanies = [
      { name: "Alpha Logística", taxId: "100-A", email: "contato@alpha.com", plan: "pro" },
      { name: "Omega Tech", taxId: "200-B", email: "ceo@omega.io", plan: "enterprise" }
    ];

    for (const data of testCompanies) {
      // 1. Criar a Empresa
      const company = await Company.findOneAndUpdate(
        { taxId: data.taxId },
        { 
          name: data.name, 
          email: data.email, 
          plan: data.plan, 
          status: "active" 
        },
        { upsert: true, new: true }
      );

      // 2. Criar um Admin para cada empresa (Senha padrão: 123456)
      const hashedPassword = await bcrypt.hash("123456", 10);
      await User.findOneAndUpdate(
        { email: data.email },
        {
          name: `Admin ${data.name}`,
          password: hashedPassword,
          role: "admin",
          companyId: company._id,
          plan: data.plan
        },
        { upsert: true }
      );

      console.log(`✅ Sucesso: ${data.name} criada e indexada.`);
    }

    console.log("\n✨ Provisionamento concluído! Verifique o Dashboard.");
    process.exit();
  } catch (err) {
    console.error("🚨 Erro:", err.message);
    process.exit(1);
  }
}

createTenants();
