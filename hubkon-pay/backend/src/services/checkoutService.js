import mongoose from "mongoose";
import Escrow from "../models/escrowModel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";

export const createCheckoutSession = async ({ companyA, companyB, amount, currency, userId }) => {
  if (!companyA || !companyB) throw new Error("Buyer and Seller required");
  if (!amount || amount <= 0) throw new Error("Amount must be > 0");

  // Calcula fee (2%)
  const fee = Math.round(amount * 0.02 * 100) / 100; 
  const netAmount = amount - fee;

  // Cria Escrow
  const escrow = await Escrow.create({
    companyA,
    companyB,
    amount,
    currency,
    fee,
    netAmount,
    status: "pending",
    createdBy: mongoose.Types.ObjectId(userId),
  });

  // Atualiza Wallet do Buyer (deduz do saldo)
  const walletA = await Wallet.findOne({ companyId: companyA });
  if (!walletA || walletA.balance < amount) throw new Error("Saldo insuficiente");
  walletA.balance -= amount;
  await walletA.save();

  // Cria registro no ledger (Transaction)
  await Transaction.create({
    escrowId: escrow._id,
    companyFrom: companyA,
    companyTo: companyB,
    amount,
    currency,
    feeApplied: fee,
    netAmount,
  });

  return {
    escrowId: escrow._id,
    amount,
    currency,
    fee,
    netAmount,
  };
};