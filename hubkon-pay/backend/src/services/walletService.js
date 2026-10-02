/**
 * @file walletService.js
 * @description Corporate Treasury & Custody Orchestration Service.
 * Version: V.1012 ELITE ✅
 */
import Wallet from "../models/walletModel.js";

/**
 * @function createWallet
 * @description Provisions a new digital vault for a corporate tenant.
 * @param {string} companyId - Unique B2B identifier.
 * @param {import('mongoose').ClientSession} [session=null] - Mongoose transaction session.
 */
export const createWallet = async (companyId, session = null) => {
  // Verificação de duplicidade com lock de sessão
  const existing = await Wallet.findOne({ companyId }).session(session);
  if (existing) {
    throw new Error("PROVISIONING_ERROR: Digital vault already exists for this tenant.");
  }

  const wallet = new Wallet({ 
    companyId,
    balance: 0,
    locked: 0 
  });

  await wallet.save({ session });
  return wallet;
};

/**
 * @function getWallet
 * @description Retrieves the current financial standing of a company.
 */
export const getWallet = async (companyId, session = null) => {
  return Wallet.findOne({ companyId }).session(session).lean(); // .lean() para performance em consultas de leitura
};

/**
 * @function updateBalance
 * @description Adjusts available liquidity (e.g., after a successful trade or deposit).
 */
export const updateBalance = async (companyId, amount, session = null) => {
  const wallet = await Wallet.findOne({ companyId }).session(session);
  if (!wallet) throw new Error("LEDGER_ERROR: Target wallet not found.");

  wallet.balance += amount;
  
  await wallet.save({ session });
  return wallet;
};

/**
 * @function lockFunds
 * @description Isolates capital from the liquid balance into a locked state for Escrow contracts.
 */
export const lockFunds = async (companyId, amount, session = null) => {
  const wallet = await Wallet.findOne({ companyId }).session(session);
  if (!wallet) throw new Error("CUSTODY_ERROR: Wallet not found.");
  
  if (wallet.balance < amount) {
    throw new Error("SOLVENCY_ERROR: Insufficient liquid balance to lock funds.");
  }

  wallet.balance -= amount;
  wallet.locked += amount;
  
  await wallet.save({ session });
  return wallet;
};

/**
 * @function releaseFunds
 * @description Moves capital from the locked Escrow state back to liquid balance.
 */
export const releaseFunds = async (companyId, amount, session = null) => {
  const wallet = await Wallet.findOne({ companyId }).session(session);
  if (!wallet) throw new Error("SETTLEMENT_ERROR: Wallet not found.");

  // Proteção contra release de valores inexistentes
  if (wallet.locked < amount) {
    throw new Error("SETTLEMENT_ERROR: Insufficient locked funds to release.");
  }

  wallet.locked -= amount;
  wallet.balance += amount;
  
  await wallet.save({ session });
  return wallet;
};
