/**
 * @file advanceService.js
 * @description Dynamic Factoring & Liquidity Engine with Solana Settlement.
 * Version: V.1022 ELITE ✅
 */

import Escrow from "../models/EscrowModel.js";
import Wallet from "../models/WalletModel.js";
import Transaction from "../models/transactionModel.js";
import Company from "../models/CompanyModel.js";
import GlobalSettings from "../models/GlobalSettings.js";
import SolanaClient from "../config/solanaClient.js"; // 📡 Injetado para o despacho criptográfico

export const requestAdvancePayment = async (escrowId, companyId) => {
  // 1️⃣ BUSCAR REGRAS GLOBAIS (O teu Dashboard em ação)
  const settingsDoc = await GlobalSettings.findOne({ key: "escrow_rules" });
  const rules = settingsDoc?.value || { fee: 0.02, advanceFee: 0.03, riskMultiplier: 10, minScore: 60 };

  const escrow = await Escrow.findById(escrowId);
  const platformWallet = await Wallet.findOne({ isPlatform: true });
  const sellerCompany = await Company.findById(companyId);

  // 🛡️ REGRA 1: Validação de Estado
  if (!escrow || escrow.status !== "approved") {
    throw new Error("Apenas contratos aprovados podem ser antecipados.");
  }

  // 🛡️ REGRA 2: Autorização
  if (String(escrow.companyB) !== String(companyId)) {
    throw new Error("Não autorizado: Apenas o vendedor solicita antecipação.");
  }

  // 🧠 REGRA 3: Inteligência de Risco (Lendo do GlobalSettings)
  if (sellerCompany.creditScore < rules.minScore) {
    throw new Error(`Reputação insuficiente. Score mínimo necessário: ${rules.minScore}`);
  }

  // 🛡️ REGRA 4: TRAVA DE LIQUIDEZ DINÂMICA (Lendo o Multiplicador do Dashboard)
  const liquidityRequired = escrow.amount * rules.riskMultiplier;
  if (platformWallet.balance < liquidityRequired) {
    throw new Error(`Liquidez baixa. Reserva de $${liquidityRequired} necessária para este risco.`);
  }

  // 💰 LÓGICA DE LUCRO TURBO DINÂMICA
  const totalRate = rules.fee + rules.advanceFee; // Ex: 0.02 + 0.03 = 0.05 (5%)
  const totalFee = Math.round(escrow.amount * totalRate * 100) / 100;
  const netToSeller = escrow.amount - totalFee;

  // 🚀 MOVIMENTO ATÓMICO: Caixa da Plataforma -> Vendedor
  platformWallet.balance -= netToSeller; 
  const sellerWallet = await Wallet.findOne({ companyId });
  sellerWallet.balance += netToSeller;

  await platformWallet.save();
  await sellerWallet.save();

  // =========================================================================
  // ⚡ GATEWAY ADICIONADO: DISPACHO DO ADIANTAMENTO PARA O CONTRATO EM RUST
  // =========================================================================
  let solanaSignature = null;
  try {
    const solanaResult = await SolanaClient.signAndSendInstruction(
      "anticipate_liquidity",
      {
        buyer: escrow.companyA,
        vendor: escrow.companyB,
        escrowAccount: escrow._id
      },
      {
        amount: escrow.amount,
        discountFee: totalFee
      }
    );
    if (solanaResult.success) solanaSignature = solanaResult.signature;
  } catch (err) {
    console.error("⚠️ [SRO FACTORING CRITICAL] Falha on-chain, jogado para reprocessamento:", err.message);
  }
  // =========================================================================

  // 📝 REGISTRO NO LEDGER
  await Transaction.create({
    company: companyId,
    amount: escrow.amount,
    feeApplied: totalFee,
    netAmount: netToSeller,
    type: "advance_payout",
    currency: escrow.currency || "USD",
    blockchainHash: solanaSignature, // Armazena o carimbo imutável da Solana
    status: solanaSignature ? "COMPLETED" : "QUEUED_FOR_RETRY",
    relatedEscrow: escrow._id
  });

  // Finalização do Escrow
  escrow.status = "released";
  escrow.history.push({ 
    action: "payment_advanced", 
    details: `Antecipação paga via Tesouraria. Taxa Total: ${totalRate * 100}%. Solana Tx: ${solanaSignature || "PENDING_QUEUE"}` 
  });
  await escrow.save();

  return { success: true, netToSeller, platformEarnings: totalFee, appliedRate: totalRate, solanaTx: solanaSignature };
};
