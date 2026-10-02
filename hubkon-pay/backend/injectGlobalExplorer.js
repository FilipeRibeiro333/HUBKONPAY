/**
 * @file injectGlobalExplorer.js
 * @description Global Block Injector for SuperAdmin Forensic Auditing.
 * Calibrated with institutional transaction enums.
 * Version: V.1026 ELITE ✅
 */

import mongoose from "mongoose";
import crypto from "crypto";
import Transaction from "./src/models/transactionModel.js";
import connectDB from "./src/config/db.js";

const injectGlobalData = async () => {
  try {
    await connectDB();
    console.log("🔍 [SRO] Injetando blocos transacionais globais assinados com a Solana...");

    // Criar IDs de empresas aleatórias para simular o tráfego de múltiplos inquilinos (Multi-Tenant)
    const company01Id = new mongoose.Types.ObjectId();
    const company02Id = new mongoose.Types.ObjectId();

    // Gerar hashes criptográficas no formato nativo da Solana
    const hashSolana1 = "5sBvNzP" + crypto.randomBytes(24).toString("hex") + "HUBKON";
    const hashSolana2 = "5sBvNzP" + crypto.randomBytes(24).toString("hex") + "HUBKON";
    const hashSolana3 = "5sBvNzP" + crypto.randomBytes(24).toString("hex") + "HUBKON";

    // Injetar Bloco 1: Empresa Alpha (Factoring Turbo)
    await Transaction.create({
      companyId: company01Id,
      amount: 75000,
      currency: "USD",
      type: "advance_payout", // ✅ Alinhado com o teu enum corporativo
      status: "COMPLETED",
      blockchainHash: hashSolana1,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    });

    // Injetar Bloco 2: Empresa Omega (Fiel Depósito)
    await Transaction.create({
      companyId: company02Id,
      amount: 120000,
      currency: "USD", // Padronizado para USD conforme o teu modelo base
      type: "advance_payout", // ✅ Alinhado com o teu enum corporativo
      status: "COMPLETED",
      blockchainHash: hashSolana2,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    });

    // Injetar Bloco 3: Liquidação Internacional
    await Transaction.create({
      companyId: company01Id,
      amount: 35000,
      currency: "USD",
      type: "advance_payout", // ✅ Alinhado com o teu enum corporativo
      status: "COMPLETED",
      blockchainHash: hashSolana3,
      createdAt: new Date()
    });

    console.log("💎 [SUCCESS] 3 Blocos Multi-Tenant com provas Web3 inseridos com sucesso!");
    console.log("\n🎉 [FINISHED] Atualiza a tua página em localhost:3000/explorer!");
    process.exit(0);

  } catch (error) {
    console.error("❌ [CRITICAL FAULT]:", error.message);
    process.exit(1);
  }
};

injectGlobalData();
