/**
 * @file injectRealOmega.js
 * @description Tenant Data Injector for Admin Omega Tech.
 * Version: V.1026 ELITE ✅ (Semana 8 Final Sync)
 */

import mongoose from "mongoose";
import Wallet from "./src/models/WalletModel.js";
import Escrow from "./src/models/EscrowModel.js";
import Company from "./src/models/CompanyModel.js";
import User from "./src/models/userModel.js";
import connectDB from "./src/config/db.js";

const injectData = async () => {
  try {
    await connectDB();
    console.log("🔍 [SRO] A localizar o perfil do utilizador Admin Omega Tech no banco...");

    // 1️⃣ Localizar o utilizador exato com a string idêntica do MongoDB
    const user = await User.findOne({ name: "Admin Omega Tech" });

    if (!user) {
      console.log("❌ [ERROR] Falha de sincronização. Utilizador não encontrado.");
      process.exit(1);
    }

    const correctCompanyId = user.companyId;
    console.log(`🎯 [FOUND] Empresa identificada: ${correctCompanyId}`);

    // 2️⃣ Promover a organização para ENTERPRISE e ACTIVE para derreter os cadeados dourados
    await Company.findByIdAndUpdate(correctCompanyId, {
      $set: { 
        plan: "enterprise", 
        subscriptionStatus: "active",
        name: "Omega Tech Global Lda" 
      }
    });
    console.log("🏢 [PLAN] Organização promovida a ENTERPRISE com sucesso.");

    // 3️⃣ Injetar Saldo Real na Carteira desta empresa no MongoDB
    await Wallet.findOneAndUpdate(
      { companyId: correctCompanyId },
      { $set: { balance: 85400, isPlatform: false } },
      { upsert: true, returnDocument: 'after' }
    );
    console.log("💰 [WALLET] Injetados $85.400 FX de saldo real na carteira correta.");

    // 4️⃣ Criar Contratos de Escrow bilaterais (Para Units e Files saírem do zero)
    await Escrow.deleteMany({ companyA: correctCompanyId }); 
    const partnerId = new mongoose.Types.ObjectId();

    // Contrato 1: Pendente (Alimenta o "Pending Settlements")
    await Escrow.create({
      companyA: correctCompanyId,
      companyB: partnerId,
      amount: 15000,
      currency: "USD",
      status: "pending",
      history: [{ action: "escrow_created", details: "Aguardando verificação de liquidez em Luanda." }]
    });

    // Contrato 2: Pago (Alimenta o "Global Documents")
    await Escrow.create({
      companyA: partnerId,
      companyB: correctCompanyId,
      amount: 32000,
      currency: "USD",
      status: "released",
      history: [{ action: "standard_release", details: "Liquidação final concluída no Deutsche Bank." }]
    });

    console.log("📦 [ESCROWS] Contratos bilaterais trancados no teu nó privado!");
    console.log("\n🎉 [FINISHED] Sincronização concluída. Atualiza o teu navegador!");
    process.exit(0);

  } catch (error) {
    console.error("❌ [CRITICAL FAULT]:", error.message);
    process.exit(1);
  }
};

injectData();
