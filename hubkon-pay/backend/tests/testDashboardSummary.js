/**
 * HUBKON PAY - EXECUTIVE DASHBOARD TEST 🏛️
 * ----------------------------------------
 * Objetivo: Consolidar lucros, volume e regras de mercado num único reporte.
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Transaction from "../src/models/TransactionModel.js";
import Company from "../src/models/CompanyModel.js";
import GlobalSettings from "../src/models/GlobalSettings.js";
import Wallet from "../src/models/WalletModel.js";

const runDashboardTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para Auditoria de Dashboard\n");

    // 1. 📊 SOMA DE LUCROS (O que a máquina imprimiu)
    const profitData = await Transaction.aggregate([
      { $group: { _id: "$currency", totalProfit: { $sum: "$feeApplied" }, count: { $sum: 1 } } }
    ]);

    // 2. 🛡️ ANÁLISE DE REDE (Confiança)
    const totalCompanies = await Company.countDocuments();
    const vipCompanies = await Company.countDocuments({ creditScore: { $gte: 60 } });

    // 3. ⚙️ REGRAS ATUAIS (Lendo o SEED que semeamos)
    const settings = await GlobalSettings.findOne({ key: "escrow_rules" });

    // 4. 🏦 TESOURARIA (O Saldo Real no Banco)
    const platformWallet = await Wallet.findOne({ isPlatform: true });

    console.log("==================================================");
    console.log("📈       HUBKON EXECUTIVE SUMMARY REPORT        ");
    console.log("==================================================");
    
    console.log("💸 RECEITA ACUMULADA POR MOEDA:");
    profitData.forEach(p => {
        console.log(`   - ${p._id}: $${p.totalProfit.toFixed(2)} (${p.count} transações)`);
    });

    console.log("\n🛡️  REPUTAÇÃO DA REDE:");
    console.log(`   - Entidades Totais: ${totalCompanies}`);
    console.log(`   - Entidades VIP:    ${vipCompanies}`);
    console.log(`   - Health Score:     ${totalCompanies > 0 ? ((vipCompanies/totalCompanies)*100).toFixed(1) : 0}%`);

    console.log("\n⚙️  REGRAS DE MERCADO (ATIVAS):");
    if (settings) {
        console.log(`   - Taxa Base:   ${settings.value.fee * 100}%`);
        console.log(`   - Taxa Turbo:  ${(settings.value.fee + settings.value.advanceFee) * 100}%`);
        console.log(`   - Regra Risco: ${settings.value.riskMultiplier}X (Liquidez)`);
    }

    console.log("\n🏦 CAIXA DA PLATAFORMA (Ford Raptor Fund):");
    console.log(`   - Saldo Disponível: $${platformWallet?.balance.toFixed(2) || "0.00"}`);
    console.log("==================================================\n");

    await mongoose.disconnect();
    console.log("🔌 Relatório finalizado. O teu império está saudável.");

  } catch (err) {
    console.error("❌ Falha no Dashboard:", err.message);
    process.exit(1);
  }
};

runDashboardTest();
