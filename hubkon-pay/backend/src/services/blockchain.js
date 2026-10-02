/**
 * @file blockchainService.js
 * @description Mock Settlement Engine for Development & Sandbox environments.
 * Simulates high-speed blockchain transaction finality for B2B payment testing.
 * 
 * @dev Frontier Hackathon Context:
 * "Dev-First approach". This module enables rapid iteration of the HUBKON PAY 
 * frontend and business logic by emulating the Solana/Sovereign Ledger latency.
 */

let txCounter = 0;

/**
 * @function createTransaction
 * @description Emulates the execution and broadcasting of a blockchain transaction.
 * @param {Object} params - Transaction payload (from, to, amount, currency).
 * @async
 * @returns {Promise<Object>} Cryptographic proof of simulated settlement.
 */
const createTransaction = async ({ from, to, amount, currency }) => {
  /** 
   * NETWORK LATENCY SIMULATION:
   * Emulating the sub-second confirmation time of high-performance networks like Solana.
   */
  await new Promise(resolve => setTimeout(resolve, 500));

  txCounter++;

  /**
   * TRANSACTION RECEIPT:
   * Returns a structured object that mirrors an on-chain transaction receipt.
   */
  return {
    txId: `HUBKON_TX_${txCounter}_${Date.now()}`, // Unique simulated Transaction Hash
    from,
    to,
    amount,
    currency: currency.toUpperCase(),
    timestamp: new Date().toISOString(),
    status: 'confirmed', // Finality reached
    network: 'HUBKON_VIRTUAL_SANDBOX'
  };
};

module.exports = {
  createTransaction
};
