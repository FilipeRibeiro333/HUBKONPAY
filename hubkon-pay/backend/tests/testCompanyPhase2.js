import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { createCompany, listCompanies } from "../src/controllers/companyController.js";

async function runTest() {
  try {
    // Conecta ao MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado com sucesso!");

    // Dados de teste
    const testCompanyData = {
      name: "Empresa Teste SaaS HUBKON",
      email: "saas-test@hubkon.com",
      plan: "premium",
      owner: new ObjectId(),
    };

    // Cria a empresa
    try {
      const company = await createCompany(testCompanyData);
      console.log("🏢 Empresa criada:", company);
    } catch (err) {
      console.error("❌ Erro ao criar empresa:", err.message);
    }

    // Lista todas as empresas
    try {
      const companies = await listCompanies();
      console.log("📃 Lista de empresas:", companies);
    } catch (err) {
      console.error("❌ Erro ao listar empresas:", err.message);
    }

    // Desconecta
    await mongoose.disconnect();
    console.log("🛑 Conexão MongoDB encerrada.");
  } catch (err) {
    console.error("❌ Erro no teste:", err.message);
  }
}

// Executa o teste
runTest();