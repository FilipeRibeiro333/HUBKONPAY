/**
 * @file escrowService.js
 * @description Sovereign Escrow Service integrated with Solana Core Contracts and Global FIAT Off-Ramp.
 * Version: V.1025 ELITE ✅ (Semana 6 Integration)
 */

import mongoose from "mongoose";
import Escrow from "../models/EscrowModel.js";
import Wallet from "../models/WalletModel.js";
import Transaction from "../models/transactionModel.js";
import Company from "../models/CompanyModel.js";
import GlobalSettings from "../models/GlobalSettings.js";
import SolanaClient from "../config/solanaClient.js"; // 📡 Injetado para a ponte Web3
import OffRampService from "./offRampService.js"; // 🌍 Injetado no topo para a Rampa de Saída Global

export const createEscrow = async ({ companyA, companyB, amount, conditions = [], createdBy }) => {
  try {
    const sanitize = (id) => id ? String(id).trim().replace(/['"]+/g, '') : null;
    const idA = sanitize(companyA);
    const idB = sanitize(companyB);
    const finalAmount = Number(amount);

    const settingsDoc = await GlobalSettings.findOne({ key: "escrow_rules" });
    const rules = settingsDoc?.value || { fee: 0.015, criticalLimit: 50000 };

    const escrow = await Escrow.create({
      companyA: new mongoose.Types.ObjectId(idA),
      companyB: new mongoose.Types.ObjectId(idB),
      amount: finalAmount,
      currency: "USD",
      status: "pending",
      conditions: conditions.map(c => ({
        description: c.description || "Settlement Milestone",
        type: c.type || "milestone",
        status: "pending"
      })),
      createdBy: createdBy ? new mongoose.Types.ObjectId(sanitize(createdBy)) : null,
      history: [{ action: "escrow_created", details: `Protocolo de $${finalAmount.toLocaleString()} iniciado.`, timestamp: new Date() }]
    });

    if (finalAmount >= rules.criticalLimit) {
      await Transaction.create({
        companyId: idA,
        relatedEscrow: escrow._id,
        amount: finalAmount,
        currency: "USD",
        status: "PENDING_APPROVAL",
        type: "critical_risk_escrow",
        approvals: [],
        createdAt: new Date()
      });
    }
    return escrow;
  } catch (error) { throw error; }
};

export const requestAdvancePayment = async (escrowId, companyId, user) => {
  const settingsDoc = await GlobalSettings.findOne({ key: "escrow_rules" });
  const rules = settingsDoc?.value || { fee: 0.015, advanceFee: 0.03, minScore: 60 };
  const escrow = await Escrow.findById(escrowId);
  if (!escrow || escrow.status !== "pending") throw new Error("Status inválido.");

  const isMaster = user?.role === 'superadmin';
  const targetCompanyId = isMaster ? escrow.companyB : companyId;
  const sellerCompany = await Company.findById(targetCompanyId);

  if (!isMaster) {
    if (sellerCompany.plan !== 'enterprise') throw new Error("PAYWALL: Requer Plano Enterprise.");
    if (sellerCompany.creditScore < rules.minScore) throw new Error("Score insuficiente.");
  }

  const platformWallet = await Wallet.findOne({ isPlatform: true });
  const sellerWallet = await Wallet.findOne({ companyId: targetCompanyId });
  const totalRate = Number(rules.fee) + Number(rules.advanceFee);
  const totalFee = Math.round(escrow.amount * totalRate * 100) / 100;
  const netToSeller = escrow.amount - totalFee;

  platformWallet.balance -= netToSeller;
  platformWallet.balance += totalFee;
  sellerWallet.balance += netToSeller;

  await platformWallet.save();
  await sellerWallet.save();
  escrow.status = "released";
  escrow.history.push({ action: "turbo_advance_executed", details: `Executado por ${user.role}`, timestamp: new Date() });
  await escrow.save();

  // =========================================================================
  // ⚡ GATEWAY ADICIONADO: DISPACHO DE ANTECIPAÇÃO PARA O CONTRATO EM RUST
  // =========================================================================
  let solanaSignature = null;
  try {
    const solanaResult = await SolanaClient.signAndSendInstruction(
      "anticipate_liquidity",
      { buyer: escrow.companyA, vendor: escrow.companyB, escrowAccount: escrow._id },
      { amount: escrow.amount, discountFee: totalFee }
    );
    if (solanaResult.success) solanaSignature = solanaResult.signature;
  } catch (err) {
    console.error("⚠️ [SRO] Falha ao liquidar antecipação on-chain, movido para fila:", err.message);
  }
  // =========================================================================

  await Transaction.create({
    companyId: targetCompanyId, amount: escrow.amount, feeApplied: totalFee, netAmount: netToSeller,
    type: "advance_payout", status: solanaSignature ? "COMPLETED" : "QUEUED_FOR_RETRY", 
    blockchainHash: solanaSignature, relatedEscrow: escrow._id
  });

  return { success: true, netToSeller, totalFee, solanaTx: solanaSignature };
};

export const approveEscrow = async (escrowId, user) => {
  const escrow = await Escrow.findById(escrowId);
  if (!escrow) throw new Error("ESCROW_NOT_FOUND");
  escrow.history.push({ action: "approved", details: `Assinado por: ${user.id}`, timestamp: new Date() });
  return await escrow.save();
};

export const releaseEscrow = async (escrowId, user) => {
  const escrow = await Escrow.findById(escrowId);
  if (!escrow) throw new Error("ESCROW_NOT_FOUND");
  const sellerWallet = await Wallet.findOne({ companyId: escrow.companyB });
  const platformWallet = await Wallet.findOne({ isPlatform: true });

  const feeRate = (user?.role === 'superadmin') ? 0.015 : 0.03;
  const fee = Math.round(escrow.amount * feeRate * 100) / 100;
  const netAmount = escrow.amount - fee;

  sellerWallet.balance += netAmount;
  platformWallet.balance += fee;
  await sellerWallet.save();
  await platformWallet.save();

  // =========================================================================
  // ⚡ GATEWAY ADICIONADO: LIBERTAÇÃO DO COFRE ON-CHAIN (BOTÃO DE ENVIO)
  // =========================================================================
  let solanaSignature = null;
  try {
    const solanaResult = await SolanaClient.signAndSendInstruction(
      "release_to_vendor",
      { buyer: escrow.companyA, escrowAccount: escrow._id },
      {}
    );
    if (solanaResult.success) solanaSignature = solanaResult.signature;
  } catch (err) {
    console.error("⚠️ [SRO] Erro na libertação on-chain da Solana:", err.message);
  }
  // =========================================================================

  // =========================================================================
  // 🌍 SEÇÃO COGNITIVA DA SEMANA 6: RAMPA DE SAÍDA GLOBAL (OFF-RAMP TRADICIONAL)
  // =========================================================================
  let fiatClearingId = null;
  let bankIbanTarget = null;

  if (solanaSignature) {
    try {
      // Quando a Solana dá sinal verde on-chain, o teu Express aciona a API internacional fiduciária
      const offRampResult = await OffRampService.executeGlobalPayout(
        escrow.companyB, // ID do vendedor internacional que vai receber o dinheiro real
        netAmount,       // O valor líquido calculado após a dedução do teu lucro
        escrow.currency  // Mantém a conformidade com a moeda estipulada (USD/EUR)
      );

      if (offRampResult.success) {
        fiatClearingId = offRampResult.clearingNetworkId;
        bankIbanTarget = offRampResult.destinationAccount;
      }
    } catch (offRampError) {
      console.error("🚨 [SRO OFF-RAMP DELAY] Liquidação on-chain com sucesso, mas clearing bancário em retry:", offRampError.message);
    }
  }
  // =========================================================================

  escrow.status = "released";
  escrow.releasedAt = new Date();
  escrow.history.push({ 
    action: "standard_release", 
    details: `Taxa: $${fee}. Solana Tx: ${solanaSignature || "PENDING_RETRY"}. SWIFT/SEPA Clearing Ref: ${fiatClearingId || "PENDING_RAILS"}`, 
    timestamp: new Date() 
  });
  await escrow.save();

  return { 
    success: true, 
    netAmount, 
    fee, 
    solanaTxHash: solanaSignature,
    fiatClearingReference: fiatClearingId,
    destinationIban: bankIbanTarget
  };
};

export const fulfillCondition = async (escrowId, conditionIndex, user) => {
  const escrow = await Escrow.findById(escrowId);
  if (!escrow) throw new Error("ESCROW_NOT_FOUND");
  escrow.conditions[conditionIndex].status = "fulfilled";
  escrow.history.push({ action: "milestone_completed", details: `Index: ${conditionIndex}`, timestamp: new Date() });
  return await escrow.save();
};
