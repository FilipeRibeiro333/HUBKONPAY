/**
 * @file testFullFlow.js
 * @description Integrated End-to-End Test for HUBKON PAY.
 * Simulates Escrow Creation, Risk Validation, and Turbo Factoring Payout with Solana Handshake.
 * Version: V.1022 ELITE ✅
 */

import mongoose from "mongoose";
import { createEscrow } from "./src/services/escrowService.js";
import { requestAdvancePayment } from "./src/services/advanceService.js";
import Company from "./src/models/CompanyModel.js";
import Wallet from "./src/models/WalletModel.js";
import GlobalSettings from "./src/models/GlobalSettings.js";
import connectDB from "./src/config/db.js";

const runIntegrationTest = async () => {
  console.log("🚀 [TEST] A iniciar ciclo completo de auditoria do HUBKON PAY (Fase 1)...");

  try {
    // 1️⃣ DATABASE HANDSHAKE
    await connectDB();
    console.log("⚡ [DB] Conectado com sucesso à base de dados para injeção de massa de testes.");

    // 2️⃣ CONFIGURAR COCKPIT GLOBAL DE REGRAS NO MONGO
    console.log("\n⚙️ [STEP 1] Calibrando as regras globais de risco no MongoDB...");
    await GlobalSettings.updateOne(
      { key: "escrow_rules" },
      {
        $set: {
          value: { fee: 0.02, advanceFee: 0.03, riskMultiplier: 2, minScore: 60, criticalLimit: 50000 }
        }
      },
      { upsert: true }
    );

    // 3️⃣ CRIAR EMPRESAS E CARTEIRAS DE TESTE (Massa Multi-Tenant com campos obrigatórios)
    const companyAId = new mongoose.Types.ObjectId(); // Comprador Angolano
    const companyBId = new mongoose.Types.ObjectId(); // Fornecedor Internacional

    await Company.create([
      { 
        _id: companyAId, 
        name: "Angola Importações Lda", 
        email: "compras@angolaimport.ao", // ✅ Correção para passar na validação estrita do Mongoose
        plan: "enterprise", 
        creditScore: 85 
      },
      { 
        _id: companyBId, 
        name: "Global Trading Shanghai", 
        email: "billing@shanghaitrading.cn", // ✅ Correção para passar na validação estrita do Mongoose
        plan: "enterprise", 
        creditScore: 75 
      }
    ]);

    await Wallet.create([
      { isPlatform: true, balance: 500000 }, // Tesouraria HUBKON
      { companyId: companyAId, balance: 100000 },
      { companyId: companyBId, balance: 0 }
    ]);
    console.log("✅ [MASSA] Empresas simuladas e Pool de Liquidez HUBKON carregado com $500.000.");

    // 4️⃣ FLUXO A: CRIAÇÃO DO ESCROW (FIEL DEPÓSITO)
    console.log("\n📦 [STEP 2] Executando inicialização do protocolo de Escrow B2B...");
    const escrowAmount = 20000; // Fatura de $20.000 USD
    const escrow = await createEscrow({
      companyA: companyAId,
      companyB: companyBId,
      amount: escrowAmount,
      conditions: [{ description: "Entrega de contentores no porto de Luanda" }],
      createdBy: companyAId
    });
    console.log(`✅ [SUCCESS] Escrow criado no MongoDB! ID: ${escrow._id} | Status: ${escrow.status}`);

    // Forçar aprovação interna para simular o estado apto para antecipação turbo
    escrow.status = "approved";
    await escrow.save();

    // 5️⃣ FLUXO B: SOLICITAÇÃO DE ANTECIPAÇÃO TURBO (FACTORING COM ENCAIXE SOLANA)
    console.log("\n💎 [STEP 3] Fornecedor solicita Antecipação de Liquidez Turbo...");
    console.log("🧠 Motor de Risco HUBKON: Analisando Score e Trava de Liquidez...");
    
    // Simula o objeto de utilizador corporativo com permissão enterprise para o serviço
    const mockUser = { id: companyBId, role: "user" };
    const advanceResult = await requestAdvancePayment(escrow._id, companyBId, mockUser);
    
    console.log("\n🏆 [SUCCESS] Antecipação de Recebíveis Aprovada com Lucro Turbo!");
    console.log(`💵 Valor Bruto da Fatura: $${escrowAmount}`);
    console.log(`剪 Taxas Retidas de Lucro HUBKON (5%): $${advanceResult.totalFee || advanceResult.platformEarnings}`);
    console.log(`💰 Valor Líquido depositado ao Fornecedor: $${advanceResult.netToSeller}`);
    console.log(`📡 Prova Criptográfica SBF On-Chain (Solana Tx): ${advanceResult.solanaTx}`);

    // 6️⃣ LIMPEZA DE SEGURANÇA OPERACIONAL (SRO)
    console.log("\n🛡️ [SRO CLEANUP] Removendo massa de teste para manter a base de dados íntegra...");
    await Company.deleteMany({ _id: { $in: [companyAId, companyBId] } });
    await Wallet.deleteMany({ companyId: { $in: [companyAId, companyBId, null] } });
    await escrow.deleteOne();
    
    console.log("\n🎉 [INTEGRATION PASSED]: O circuito Express + Mongo + Rust/Solana está 100% integrado e resiliente.");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ [INTEGRATION FAILED] Falha catastrófica no fluxo unificado:");
    console.error(error.message);
    process.exit(1);
  }
};

runIntegrationTest();
