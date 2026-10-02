/**
 * @file injectTenantData.js
 * @description Dynamic Tenant Data Injector for HUBKON PAY.
 * Injects real balances and escrow documents for the active dashboard user.
 * Version: V.1025 ✅
 */

import mongoose from "mongoose";
import Wallet from "./src/models/WalletModel.js";
import Escrow from "./src/models/EscrowModel.js";
import Company from "./src/models/CompanyModel.js";
import connectDB from "./src/config/db.js";

const injectData = async () => {
  try {
    await connectDB();
    console.log("🔍 [SRO] A localizar a organização do teu utilizador visual...");

    // O ID real que o teu terminal do Express exibiu para o teu utilizador logado
    const targetCompanyId = "69f82d6259e0739d733ecba6"; 
    const partnerCompanyId = new mongoose.Types.ObjectId(); // Empresa parceira fictícia para o Escrow

    // 1. Garantir que a empresa existe ou atualizar o plano dela para Enterprise para libertar os cadeados
    await Company.findByIdAndUpdate(targetCompanyId, {
      $set: { plan: "enterprise", subscriptionStatus: "active", name: "Omega Tech Angola Lda" }
    }, { upsert: true });

    // 2. Injetar Saldo Real na Carteira desta empresa no MongoDB
    await Wallet.findOneAndUpdate(
      { companyId: targetCompanyId },
      { $set: { balance: 85400, isPlatform: false } }, // Injeta $85.400 FX de liquidez real para esta empresa
      { upsert: true, new: true }
    );
    console.log("💰 [WALLET] Injetados $85.400 FX de saldo real para a Omega Tech.");

    // 3. Criar Contratos de Escrow onde esta empresa participa (Para preencher os contadores de Units/Files)
    await Escrow.deleteMany({ companyA: targetCompanyId }); // Limpa testes antigos do tenant

    // Contrato 1: Pendente (Vai alimentar o "Pending Settlements")
    await Escrow.create({
      companyA: targetCompanyId,
      companyB: partnerCompanyId,
      amount: 15000,
      currency: "USD",
      status: "pending",
      history: [{ action: "escrow_created", details: "Aguardando confirmação EMIS." }]
    });

    // Contrato 2: Libertado/Pago (Vai alimentar o "Global Documents")
    await Escrow.create({
      companyA: partnerCompanyId,
      companyB: targetCompanyId,
      amount: 32000,
      currency: "USD",
      status: "released",
      history: [{ action: "standard_release", details: "Liquidação concluída no Deutsche Bank." }]
    });

    console.log("📦 [ESCROWS] Contratos bilaterais injetados e trancados no teu nó privado!");
    console.log("\n🎉 [FINISHED] Sincronização concluída. Atualiza o teu painel no navegador!");
    process.exit(0);

  } catch (error) {
    console.error("❌ [CRITICAL FAULT]:", error.message);
    process.exit(1);
  }
};

injectData();
