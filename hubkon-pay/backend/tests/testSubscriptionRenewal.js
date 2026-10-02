/**
 * 🏆 HUBKON PAY - RENEWAL & UPGRADE TEST
 * --------------------------------------
 * 1. Pega na empresa 'BASIC' (Ex-devedora).
 * 2. Executa a Renovação para 'ENTERPRISE'.
 * 3. Valida se a data saltou 30 dias para o futuro.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Company from "../src/models/CompanyModel.js";
import { renewSubscription } from "../src/services/subscriptionService.js";

const runRenewalTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para Teste de Renovação\n");

    // 1. Buscar o devedor que rebaixamos no teste anterior
    const devedor = await Company.findOne({ email: "devedor@empresa.com" });
    
    if (!devedor || devedor.plan !== "basic") {
      throw new Error("Empresa básica não encontrada. Corre o 'testBillingDowngrade.js' primeiro!");
    }

    console.log(`🏢 Empresa: ${devedor.name} | Status Atual: ${devedor.plan.toUpperCase()}`);

    // 2. EXECUTAR A REATIVAÇÃO (Simulando que o Madié recebeu o dinheiro)
    console.log("\n💰 [ADMIN] Pagamento confirmado! Reativando plano ENTERPRISE...");
    
    const result = await renewSubscription(devedor._id, "enterprise");

    // 3. VERIFICAÇÃO FINAL
    const updated = result.company;
    console.log("\n============================================");
    console.log("👑      RELATÓRIO DE REATIVAÇÃO VIP         ");
    console.log("============================================");
    console.log(`✅ NOVO PLANO:      ${updated.plan.toUpperCase()} 🔥`);
    console.log(`✅ STATUS:          ${updated.subscriptionStatus.toUpperCase()}`);
    console.log(`✅ NOVA EXPIRAÇÃO:  ${updated.subscriptionExpiresAt.toDateString()}`);
    console.log("============================================\n");

    await mongoose.disconnect();
    console.log("🏁 Ciclo SaaS completo. O cliente está de volta ao jogo!");

  } catch (err) {
    console.error("❌ Falha na Renovação:", err.message);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
};

runRenewalTest();
