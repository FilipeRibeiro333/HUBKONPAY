/**
 * HUBKON PAY - REPUTATION & RISK TEST
 * -----------------------------------
 * Testando a evolução automática de 'Novato' para 'VIP'.
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

// ✅ CORREÇÃO: O caminho correto deve incluir o 'src'
import Company from "../src/models/CompanyModel.js"; 
import { updateCompanyReputation } from "../src/services/reputationService.js";

const runReputationTest = async () => {
  try {
    // 1️⃣ Conexão
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI não definida!");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para teste de Reputação");

    // 🧹 Limpeza inicial
    await Company.deleteMany({});

    // 2️⃣ Criar Empresa "Novata" (Score 50 - Neutra)
    const comp = await Company.create({ 
        name: "Angola Traders Ltd", 
        email: "info@angola.com",
        creditScore: 50,
        maxAdvanceLimit: 500,
        isEligibleForAdvance: false
    });

    console.log(`\n🏢 Entidade: ${comp.name}`);
    console.log(`📊 Status Inicial: Score ${comp.creditScore} | Limite $${comp.maxAdvanceLimit} | Elegível: ${comp.isEligibleForAdvance}`);

    // 3️⃣ Simular 5 Transações de Sucesso ($1000 cada)
    console.log("\n🚀 Processando ciclo de 5 transações de confiança...");
    for (let i = 1; i <= 5; i++) {
        // O reputationService vai subir o score e o limite a cada volta
        await updateCompanyReputation(comp._id, 1000);
    }

    // 4️⃣ Resultado Final (A metamorfose para VIP)
    const vipComp = await Company.findById(comp._id);

    console.log("\n============================================");
    console.log("🏆      RELATÓRIO DE EVOLUÇÃO HUBKON       ");
    console.log("============================================");
    console.log(`✅ Novo Credit Score: ${vipComp.creditScore} (Nível Pro!)`);
    console.log(`✅ Novo Limite de Crédito: $${vipComp.maxAdvanceLimit}`);
    console.log(`✅ Elegível para Antecipação: ${vipComp.isEligibleForAdvance ? "SIM 🔥 (Libertado)" : "NÃO"}`);
    console.log(`✅ Volume Total Transacionado: $${vipComp.totalVolumeUSD}`);
    console.log("============================================\n");

    await mongoose.disconnect();
    console.log("🔌 Teste finalizado. O sistema 'aprendeu' a confiar na empresa.");

  } catch (err) {
    console.error("❌ [ERRO DE TESTE]:", err.message);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(1);
  }
};

runReputationTest();
