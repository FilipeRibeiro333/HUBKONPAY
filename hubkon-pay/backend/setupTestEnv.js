import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/UserModel.js";
import Company from "./src/models/CompanyModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hubkon_pay";

const setup = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB conectado para setup de testes");

    // Limpar collections
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log("🗑️ Usuários e empresas antigos removidos");

    // Criar empresas
    const [empresaA, empresaB] = await Company.create([
      { name: "Empresa A", email: "empresaA@hubkon.com" },
      { name: "Empresa B", email: "empresaB@hubkon.com" }
    ]);
    console.log(`🏢 Empresas criadas: ${empresaA.name} (${empresaA._id}), ${empresaB.name} (${empresaB._id})`);

    // Criar usuários de teste
    const users = await User.create([
      {
        name: "Debug User A",
        email: "debugusera@hubkon.com", // lowercase
        password: "Senha123!",
        role: "user",
        companyId: empresaA._id
      },
      {
        name: "Debug User B",
        email: "debuguserb@hubkon.com", // lowercase
        password: "Senha123!",
        role: "user",
        companyId: empresaB._id
      },
      {
        name: "Admin Super",
        email: "admin@hubkon.com",
        password: "Senha123!",
        role: "superadmin",
        companyId: null // superadmin sem empresa
      }
    ]);

    console.log(`👤 Usuários criados: ${users.map(u => `${u.name} (${u.email})`).join(", ")}`);
    console.log("🎯 Setup de teste concluído com sucesso!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Erro no setup de teste:", err);
    process.exit(1);
  }
};

setup();