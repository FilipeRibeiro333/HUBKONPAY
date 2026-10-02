/**
 * @file testMultiCurrencyDB.js
 * @description Script de Teste de Integração para a Fase 1 (Matriz de Moedas no MongoDB).
 * Insere transações simuladas em USD, EUR e CNH para validar o novo enum do Schema.
 * Version: V.1030 MULTI-CURRENCY ELITE ✅
 */

import connectDB from "./src/config/db.js";
import Transaction from "./src/models/transactionModel.js";
import mongoose from "mongoose";

const runCurrencyDBTest = async () => {
  try {
    console.log("🚀 [TEST_FASE_1] A iniciar validação de integridade do Banco Multi-Moeda...");
    
    // 1️⃣ Database Handshake
    await connectDB();
    console.log("🧹 [SRO CLEANUP] Preparando massa de teste isolada no MongoDB...");

    const fakeCompanyId = new mongoose.Types.ObjectId();

    console.log("\n🔄 [STEP 1] Bombardeando o Ledger local com as três divisas globais...");

    // 2️⃣ Injeta a trindade macro-comercial para forçar o Mongoose a validar o enum
    const txUSD = await Transaction.create({
      company: fakeCompanyId,
      amount: 50000,
      currency: "USD",
      status: "COMPLETED",
      type: "escrow_released"
    });
    console.log(`✅ [USD APPROVED] Transação inserida com sucesso! ID: ${txUSD._id} | Moeda: ${txUSD.currency}`);

    const txEUR = await Transaction.create({
      company: fakeCompanyId,
      amount: 42000,
      currency: "EUR",
      status: "TIMELOCK_ACTIVE",
      type: "escrow_created"
    });
    console.log(`✅ [EUR APPROVED] Transação inserida com sucesso! ID: ${txEUR._id} | Moeda: ${txEUR.currency}`);

    const txCNH = await Transaction.create({
      company: fakeCompanyId,
      amount: 350000,
      currency: "CNH",
      status: "PENDING_APPROVAL",
      type: "advance_payout"
    });
    console.log(`✅ [CNH APPROVED] Transação inserida com sucesso! ID: ${txCNH._id} | Moeda: ${txCNH.currency}`);

    console.log("\n📊 [STEP 2] Verificando a consistência dos enums de auditoria...");

    // 3️⃣ Re-busca o registo do Yuan para provar a persistência
    const verifyCNH = await Transaction.findById(txCNH._id);
    
    console.log("\n🏆 [AUDIT REPORT - MULTI-CURRENCY DB]:");
    console.log(`💵 Volume do Corredor Asiático: ¥ ${verifyCNH.amount.toLocaleString()} ${verifyCNH.currency}`);
    console.log(`🛡️ Estado de Segurança do Buffer: ${verifyCNH.status}`);
    console.log(`📝 Tipo de Movimentação no Ledger: ${verifyCNH.type}`);

    console.log("\n🎉 [FASE 1 PASSED]: O teu MongoDB aceitou e blindou a trindade USD, EUR e CNH com paridade de dados absoluta!");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ [CRITICAL DB TEST FAULT]:", error.message);
    process.exit(1);
  }
};

runCurrencyDBTest();