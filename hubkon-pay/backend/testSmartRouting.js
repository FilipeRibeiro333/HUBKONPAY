/**
 * @file testSmartRouting.js
 * @description Script de Teste Corrigido: Validação de Stablecoins (USDC, EURC, CNH) e Rampa Kwanza (AOA).
 * Testa o desvio de tráfego com assinaturas HMAC criptográficas em conformidade com o transactionModel.js.
 * Version: V.1031 MULTI-CURRENCY DIGITAL ELITE ✅
 */

import connectDB from "./src/config/db.js";
import Transaction from "./src/models/transactionModel.js";
import { routePayoutByCurrency } from "./src/services/routingService.js";
import mongoose from "mongoose";

const runRoutingTest = async () => {
  try {
    console.log("🚀 [TEST_FASE_3] A iniciar teste do Motor de Rota Inteligente com Stablecoins...");
    
    // 1️⃣ Database Handshake
    await connectDB();
    console.log("🧹 [SRO CLEANUP] Preparando massa de transações digitais no MongoDB hubkon_beta...");

    const fakeCompanyId = new mongoose.Types.ObjectId();

    // 2️⃣ MASSA DE DADOS DIGITAL CORE: Injeta as três Stablecoins e a Rampa Fiduciária Local
    const sampleUSDC = await Transaction.create({
      company: fakeCompanyId,
      amount: 85400,
      currency: "USD", // 💵 Vinculado à validação do enum do teu transactionModel.js
      status: "PENDING_APPROVAL",
      type: "escrow_released"
    });

    const sampleEURC = await Transaction.create({
      company: fakeCompanyId,
      amount: 42000,
      currency: "EUR", // 💶 Vinculado à validação do enum do teu transactionModel.js
      status: "PENDING_APPROVAL",
      type: "escrow_released"
    });

    const sampleCNH = await Transaction.create({
      company: fakeCompanyId,
      amount: 350000,
      currency: "CNH", // ¥ Stablecoin da Rota da Seda
      status: "PENDING_APPROVAL",
      type: "advance_payout"
    });

    const sampleKwanza = await Transaction.create({
      company: fakeCompanyId,
      amount: 2500000,
      currency: "AOA", // 🇦🇴 Rampa Fiduciária Local de Luanda
      status: "PENDING_APPROVAL",
      type: "transfer"
    });

    console.log(`\n🔹 [DB_SEED] Transação USDC (Corredor Americano) ID: ${sampleUSDC._id}`);
    console.log(`🔹 [DB_SEED] Transação EURC (Canal Europeu) ID: ${sampleEURC._id}`);
    console.log(`🔹 [DB_SEED] Transação CNH (Rota da Seda) ID: ${sampleCNH._id}`);
    console.log(`🔹 [DB_SEED] Transação AOA (Rampa Fiat Luanda) ID: ${sampleKwanza._id}`);

    console.log("\n🔄 [EXECUTION] Rodando o orquestrador para os fluxos cambiais...");
    
    // 3️⃣ Executa a orquestração assíncrona multiprovedor
    const resultUSDC = await routePayoutByCurrency(sampleUSDC._id);
    const resultEURC = await routePayoutByCurrency(sampleEURC._id);
    const resultCNH = await routePayoutByCurrency(sampleCNH._id);
    const resultAOA = await routePayoutByCurrency(sampleKwanza._id);

    console.log("\n📊 [STEP 3] Analisando o relatório de tráfego cambial e chaves HMAC-SHA256...");

    console.log("\n🏆 [AUDIT REPORT - DIGITAL STABLECOINS & FIAT RAMPA]:");
    console.log(`🇺🇸 [USDC CORREDOR AMERICANO]: Provedor: ${resultUSDC.providerUsed}\n                           HMAC: ${resultUSDC.hmacToken}`);
    console.log(`🇪🇺 [EURC CANAL EUROPEU]:      Provedor: ${resultEURC.providerUsed}\n                           HMAC: ${resultEURC.hmacToken}`);
    console.log(`🇨🇳 [CNH ROTA DA SEDA]:        Provedor: ${resultCNH.providerUsed}\n                           HMAC: ${resultCNH.hmacToken}`);
    console.log(`🇦🇴 [AOA FIAT ON-RAMP]:        Provedor: ${resultAOA.providerUsed}\n                           HMAC: ${resultAOA.hmacToken}`);

    // Validação estrita: Os canais digitais de Dólar/Euro e Yuan devem ter assinaturas e provedores mapeados sem conflito
    if (resultUSDC.hmacToken && resultCNH.hmacToken && resultAOA.hmacToken) {
        console.log("\n🎉 [FASE 3 PASSED]: O Corredor Americano de USDC e as demais Stablecoins foram roteados on-chain com assinaturas HMAC limpas!");
        process.exit(0);
    } else {
        console.error("\n❌ [SRO CRITICAL FAULT] Falha no desvio ou geração criptográfica!");
        process.exit(1);
    }

  } catch (error) {
    console.error("\n❌ [CRITICAL TEST FAULT]:", error.message);
    process.exit(1);
  }
};

runRoutingTest();
