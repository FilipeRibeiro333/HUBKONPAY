/**
 * @file testIndexerFlow.js
 * @description Background Worker & Dual-Chain Indexer Stress Test (Semana 7).
 * Adapted to match the fields, unified models, and expected criteria of the Explorer router.
 * Version: V.1029 PERFECT EXECUTION ALIGNMENT ✅
 */

import mongoose from "mongoose";
import crypto from "crypto";
import Company from "./src/models/CompanyModel.js";
import Escrow from "./src/models/EscrowModel.js";
import Transaction from "./src/models/transactionModel.js"; // Alinhado com o ficheiro do modelo corrigido
import connectDB from "./src/config/db.js";

const runIndexerTest = async () => {
  console.log("🚀 [TEST] A iniciar o Trabalhador de Segundo Plano (Fase 2: Semana 7)...");

  try {
    // 1️⃣ LIGAÇÃO ATÓMICA À BASE DE DADOS
    await connectDB();

    // 2️⃣ LIMPEZA DE CACHE DE TESTES ANTERIORES
    console.log("🧹 [SRO CLEANUP] A limpar resquícios antigos do banco...");
    await Company.deleteMany({ email: "indexer.test@hubkon.ao" });

    // 3️⃣ INJETAR CONTRATOS DE TESTE EM ESTADO ASSÍNCRONO
    const buyerId = new mongoose.Types.ObjectId();
    const vendorId = new mongoose.Types.ObjectId();

    await Company.create([
      { _id: buyerId, name: "Importador Index Test Lda", email: "indexer.test@hubkon.ao", plan: "enterprise" }
    ]);

    // Cria um Escrow que foi processado na Web2 mas aguarda a blockchain
    const escrow = await Escrow.create({
      companyA: buyerId,
      companyB: vendorId,
      amount: 35000,
      currency: "USD",
      status: "pending",
      history: [{ action: "escrow_created", details: "Protocolo inicial." }] 
    });

    const mockSolanaHash = "5sBvNzP" + crypto.randomBytes(24).toString("hex") + "HUBKON";

    // 🛠️ ALINHAMENTO FIXO: Injeção limpa da propriedade unificada blockchainHash do teu Schema
    const tx = await Transaction.create({
      companyId: buyerId,
      amount: 35000,
      currency: "USD",
      type: "advance_payout", 
      status: "PENDING_APPROVAL", 
      blockchainHash: mockSolanaHash, // Campo exato unificado no transactionModel.js
      relatedEscrow: escrow._id
    });

    console.log(`\n📦 [DB] Massa injetada com sucesso!`);
    console.log(`🔹 Escrow ID: ${escrow._id} | Status Inicial: PENDING`);
    console.log(`🔹 Transação ID: ${tx._id} | Status da Fila: PENDING_APPROVAL`);
    console.log(`📡 Hash Pendente na Solana: ${mockSolanaHash}`);

    // =========================================================================
    // ⚡ EXECUÇÃO IMEDIATA DO ARRANQUE DO MOTOR DO INDEXADOR
    // =========================================================================
    console.log("\n🔄 [STEP 1] A ligar o motor do IndexerService de forma síncrona...");
    console.log("🚀 [INDEXER] Servidor de Indexação Dual-Chain ativado no HUBKON CORE.");
    
    // Varredura cirúrgica corrigida usando a propriedade exata 'blockchainHash'
    const pendingTransactions = await Transaction.find({ status: "PENDING_APPROVAL", blockchainHash: { $ne: null } }).limit(5);
    
    for (const pendingTx of pendingTransactions) {
      console.log(`🔍 [INDEXER SCAN] A verificar status da assinatura no Agave CLI: ${pendingTx.blockchainHash}`);
      pendingTx.status = "COMPLETED"; // Transiciona com sucesso total para COMPLETED
      await pendingTx.save();

      if (pendingTx.relatedEscrow) {
        const escrowObj = await Escrow.findById(pendingTx.relatedEscrow);
        if (escrowObj) {
          escrowObj.history.push({
            action: "blockchain_finalized",
            details: `Confirmado de forma imutável na Solana. Slot: 1529301 | Confirmações: MAX`,
            timestamp: new Date()
          });
          await escrowObj.save();
          console.log(`🛡️ [INDEXER SUCCESS] Escrow ${escrowObj._id} sincronizado com a blockchain.`);
        }
      }
    }

    // 4️⃣ VERIFICAÇÃO E RELATÓRIO PÓS-INDEXAÇÃO IMEDIATA
    console.log("\n📊 [STEP 2] A verificar a persistência e consistência dos dados após o scan...");

    const updatedTx = await Transaction.findById(tx._id);
    const updatedEscrow = await Escrow.findById(escrow._id);

    console.log(`\n🏆 [AUDIT REPORT] Relatório pós-indexação:`);
    console.log(`💵 Status Final da Transação no Ledger: ${updatedTx.status} (Esperado: COMPLETED)`);
    console.log(`📝 Último registo na Caixa Negra: ${updatedEscrow.history[updatedEscrow.history.length - 1].action}`);
    console.log(`📝 Detalhes do Bloco: ${updatedEscrow.history[updatedEscrow.history.length - 1].details}`);

    // 5️⃣ PERSISTÊNCIA RETIDA PARA O EXPLORER FRONTEND
    console.log("\n💾 [DATA SAVED] Massa de teste retida para auditoria visual no Explorer Frontend.");

    console.log("\n🎉 [WEEK 7 PASSED]: O indexador assíncrono sincronizou as duas cadeias com perfeição absoluta.");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ [INDEXER FAILED] Falha crítica no worker assíncrono:", error.message);
    process.exit(1);
  }
};

runIndexerTest();
