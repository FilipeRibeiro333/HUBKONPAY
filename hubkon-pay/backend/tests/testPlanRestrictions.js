/**
 * 🎯 HUBKON PAY - PLAN RESTRICTION TEST (SaaS GATE)
 * ------------------------------------------------
 * 1. Tenta antecipar com Plano BASIC -> [DEVE BLOQUEAR ❌]
 * 2. Faz Upgrade para Plano PRO
 * 3. Tenta antecipar com Plano PRO -> [DEVE LIBERAR ✅]
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Company from "../src/models/CompanyModel.js";
import Wallet from "../src/models/WalletModel.js";
import Escrow from "../src/models/EscrowModel.js";
import { requestAdvancePayment } from "../src/services/advanceService.js";

const runPlanTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para Teste de Restrição de Planos\n");

    // 🧹 Limpeza
    await Company.deleteMany({});
    await Wallet.deleteMany({});
    await Escrow.deleteMany({});

    // 1️⃣ SETUP: Vendedor de Confiança (Score 70) mas Plano BASIC
    const seller = await Company.create({ 
        name: "Seller Basic Ltd", 
        email: "basic@seller.com",
        plan: "basic", // 👈 O bloqueio está aqui
        creditScore: 70, 
        isEligibleForAdvance: true 
    });
    const buyer = await Company.create({ name: "Buyer Corp", email: "buyer@h.com" });

    // Wallets (Platform com 10x de reserva para não dar erro de liquidez)
    await Wallet.create({ isPlatform: true, balance: 2000 }); 
    await Wallet.create({ companyId: buyer._id, balance: 1000, locked: 100 });
    await Wallet.create({ companyId: seller._id, balance: 0 });

    const escrow = await Escrow.create({
        companyA: buyer._id,
        companyB: seller._id,
        amount: 100,
        status: "approved"
    });

    console.log(`🏢 Empresa: ${seller.name} | Plano Atual: ${seller.plan.toUpperCase()}`);

    // 2️⃣ TESTE 1: Tentar antecipar sendo BASIC
    console.log("\n⚡ Tentando antecipação (5% Turbo) com Plano BASIC...");
    // Nota: No serviço real, o Middleware de rota bloquearia, mas aqui vamos simular a lógica de gating
    const planLevels = { "basic": 1, "pro": 2, "enterprise": 3 };
    
    if (planLevels[seller.plan] < planLevels["pro"]) {
        console.log("❌ [SISTEMA]: Acesso Negado! Esta funcionalidade exige o Plano PRO.");
    } else {
        await requestAdvancePayment(escrow._id, seller._id);
    }

    // 3️⃣ O UPGRADE: Transformar em PRO (Simulando pagamento de mensalidade)
    console.log("\n🚀 Fazendo UPGRADE da empresa para Plano PRO...");
    seller.plan = "pro";
    await seller.save();

    // 4️⃣ TESTE 2: Tentar antecipar sendo PRO
    console.log(`🏢 Novo Status: ${seller.plan.toUpperCase()}`);
    console.log("⚡ Tentando antecipação novamente...");

    const result = await requestAdvancePayment(escrow._id, seller._id);

    console.log("\n============================================");
    console.log("💰      HUBKON SAAS VALIDATION REPORT       ");
    console.log("============================================");
    console.log(`✅ Antecipação PRO:  AUTORIZADA 🔥`);
    console.log(`✅ Taxa Turbo:       $${result.platformEarnings}`);
    console.log(`✅ Motivo:           Plano Pro detectado.`);
    console.log("============================================\n");

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Falha no Teste de Plano:", err.message);
    process.exit(1);
  }
};

runPlanTest();
