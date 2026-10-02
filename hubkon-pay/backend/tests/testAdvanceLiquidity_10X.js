/**
 * HUBKON PAY - 10X LIQUIDITY STRESS TEST 🛡️
 * ----------------------------------------
 * Objetivo: Provar que o sistema NEGA a antecipação se a plataforma
 * não tiver 10x o valor em reserva (Platform Profit).
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Company from "../src/models/CompanyModel.js";
import Wallet from "../src/models/WalletModel.js";
import Escrow from "../src/models/EscrowModel.js";
import { requestAdvancePayment } from "../src/services/advanceService.js";

const runLiquidityTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para Teste de Stress (Regra dos 10X)");

    // 🧹 Limpeza
    await Company.deleteMany({});
    await Wallet.deleteMany({});
    await Escrow.deleteMany({});

    // 1️⃣ SETUP: Vendedor de Confiança (VIP)
    const seller = await Company.create({ 
        name: "Seller VIP", 
        email: "vip@seller.com",
        creditScore: 70, 
        isEligibleForAdvance: true 
    });
    const buyer = await Company.create({ name: "Buyer", email: "b@h.com" });

    // 2️⃣ SETUP: Wallets com POUCO LUCRO na Plataforma
    // Simulamos que a Hubkon só lucrou $500 até agora.
    await Wallet.create({ isPlatform: true, balance: 500 }); 
    await Wallet.create({ companyId: buyer._id, balance: 1000, locked: 200 }); // Escrow de $200
    await Wallet.create({ companyId: seller._id, balance: 0 });

    const escrow = await Escrow.create({
        companyA: buyer._id,
        companyB: seller._id,
        amount: 100, // O vendedor quer antecipar $100
        status: "approved"
    });

    console.log(`\n💰 [SITUAÇÃO] Lucro em Caixa: $500 | Pedido de Antecipação: $100`);
    console.log(`⚠️  [REGRA] Necessário 10x ($1000) para autorizar.`);

    // 3️⃣ A PROVA: Tentar antecipar sem liquidez 10x
    console.log("\n⚡ Tentando processar antecipação...");
    
    try {
        await requestAdvancePayment(escrow._id, seller._id);
        console.log("❌ ERRO: O sistema autorizou sem ter 10x! (Falha de Segurança)");
    } catch (error) {
        console.log(`✅ SUCESSO: Sistema bloqueou corretamente! Motivo: ${error.message}`);
    }

    // 4️⃣ CENÁRIO DE VITÓRIA: Aumentar lucro da plataforma para $1500
    console.log("\n🚀 Aumentando lucro da plataforma para $1500 (Simulando crescimento)...");
    await Wallet.findOneAndUpdate({ isPlatform: true }, { balance: 1500 });

    console.log("⚡ Tentando processar antecipação novamente...");
    const result = await requestAdvancePayment(escrow._id, seller._id);
    
    console.log("============================================");
    console.log("📊   RELATÓRIO DE LIQUIDEZ HUBKON (10X)   ");
    console.log("============================================");
    console.log(`✅ Antecipação: AUTORIZADA 🔥`);
    console.log(`✅ Taxa Turbo Coletada: $${result.platformEarnings}`);
    console.log(`✅ Saldo Restante Plataforma: $${(1500 - result.netToSeller).toFixed(2)}`);
    console.log("============================================\n");

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Falha crítica:", err.message);
    process.exit(1);
  }
};

runLiquidityTest();
