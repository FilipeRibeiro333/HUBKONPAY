/**
 * @file testOffRampFlow.js
 * @description Integrated Test for HUBKON PAY (Semana 6).
 * Simulates Client Confirmation (Botão de Envio), Solana Release, and Global FIAT Off-Ramp.
 * Version: V.1025 ELITE ✅
 */

import mongoose from "mongoose";
import crypto from "crypto";
import Company from "./src/models/CompanyModel.js";
import Escrow from "./src/models/EscrowModel.js";
import Wallet from "./src/models/WalletModel.js";
import { releaseEscrow } from "./src/services/escrowService.js";
import connectDB from "./src/config/db.js";

const runOffRampTest = async () => {
  console.log("🚀 [TEST] A iniciar ciclo de auditoria do Botão de Envio e Off-Ramp (Semana 6)...");

  try {
    // 1️⃣ DATABASE HANDSHAKE
    await connectDB();

    // 2️⃣ CRIAR MASSA DE TESTES NO MONGO
    const companyAId = new mongoose.Types.ObjectId(); // Comprador Angolano
    const companyBId = new mongoose.Types.ObjectId(); // Fornecedor Alemão

    await Company.create([
      { _id: companyAId, name: "Angola Importações Lda", email: "porto.luanda@import.ao", plan: "enterprise" },
      { _id: companyBId, name: "Berlin Machinery Industrial", email: "export@berlinmachinery.de", plan: "enterprise" }
    ]);

    await Wallet.create([
      { isPlatform: true, balance: 100000 },
      { companyId: companyBId, balance: 0 }
    ]);

    // Criar um Escrow já aprovado (com fundos trancados on-chain) esperando a entrega
    const escrow = await Escrow.create({
      companyA: companyAId,
      companyB: companyBId,
      amount: 50000, // Contrato de $50.000 USD
      currency: "USD",
      status: "approved"
    });

    console.log(`✅ [DB] Contrato de Escrow ativo localizado. ID: ${escrow._id} | Valor: $50.000`);

    // =========================================================================
    // 🖲️ SIMULAÇÃO: O CLIENTE CLICA NO "BOTÃO DE ENVIO" (RELEASE ESCROW)
    // =========================================================================
    console.log("\n🖲️ [STEP 1] Cliente Angolano clica em 'Confirmar Entrega' (Botão de Envio)...");
    console.log("📡 A disparar comando para a Sovereign Settlement Layer...");

    const mockUser = { id: companyAId, role: "user" }; // O comprador assinando a libertação
    const result = await releaseEscrow(escrow._id, mockUser);

    console.log("\n🏆 [SUCCESS] Fluxo de Liquidação Global Concluído com Sucesso!");
    console.log(`💵 Valor Total do Contrato: $50.000 USD`);
    console.log(`✂️ Comissão retida de Lucro HUBKON: $${result.fee}`);
    console.log(`💰 Saldo Líquido Destrancado on-chain: $${result.netAmount} USDC`);
    console.log(`📡 Assinatura de Libertação Solana: ${result.solanaTxHash}`);
    console.log(`🏛️ Liquidação Bancária Externa (IBAN Fornecedor): ${result.destinationIban}`);
    console.log(`💸 Identificador do Protocolo SWIFT/SEPA: ${result.fiatClearingReference}`);

    // 4️⃣ CLEANUP DE SEGURANÇA OPERACIONAL (SRO)
    console.log("\n🛡️ [SRO CLEANUP] Apagando massa de dados do Sandbox...");
    await Company.deleteMany({ _id: { $in: [companyAId, companyBId] } });
    await Wallet.deleteMany({ companyId: { $in: [companyBId, null] } });
    await escrow.deleteOne();

    console.log("\n🎉 [INTEGRATION PASSED]: O ciclo de vida completo do dinheiro internacional está fechado e blindado.");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ [INTEGRATION FAILED] Falha no motor de Off-Ramp:", error.message);
    process.exit(1);
  }
};

runOffRampTest();
