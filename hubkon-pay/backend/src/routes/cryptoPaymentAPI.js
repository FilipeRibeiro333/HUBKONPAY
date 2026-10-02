/**
 * @file cryptoPaymentAPI.js
 * @description Sovereign Ledger API Gateway for HUBKON PAY.
 * Provides endpoints for B2B transaction broadcasting, block mining, and chain exploration.
 * 
 * @dev Frontier Hackathon Context:
 * "The Network Interface". This API allows external corporate systems and the Hubkon 
 * frontend to interact with the Sovereign Ledger, ensuring real-time settlement visibility.
 */

const express = require('express');
const router = express.Router();
const blockchain = require('../utils/blockchain');

/**
 * @route   POST /api/crypto-payment/transaction
 * @desc    Broadcasts a new B2B transaction to the pending mempool.
 * @access  Private (Authenticated Corporate Tenant)
 */
router.post('/transaction', (req, res) => {
  const { from, to, amount } = req.body;
  
  // 1️⃣ INPUT VALIDATION: Ensuring mandatory B2B transaction metadata
  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'REQUIRED_FIELDS_MISSING: from, to, and amount are mandatory.' });
  }

  // 2️⃣ BROADCAST: Adding to the Sovereign Ledger's mempool
  blockchain.addTransaction({ from, to, amount, timestamp: Date.now() });
  
  res.json({ 
    success: true,
    message: 'TRANSACTION_QUEUED: Successfully added to the pending mempool.', 
    transaction: { from, to, amount } 
  });
});

/**
 * @route   GET /api/crypto-payment/mine
 * @desc    Triggers the Proof-of-Work (PoW) consensus to seal pending transactions.
 * @access  Private (Authorized Hubkon Node)
 */
router.get('/mine', (req, res) => {
  /** 
   * 3️⃣ CONSENSUS EXECUTION:
   * Seals the mempool into an immutable block.
   */
  const minedBlock = blockchain.minePendingTransactions();
  
  if (!minedBlock) {
    return res.status(400).json({ error: 'MEMPOOL_EMPTY: No pending transactions to mine.' });
  }

  res.json({ 
    success: true,
    message: 'BLOCK_SEALED: Transactions successfully settled in the ledger.', 
    block: minedBlock 
  });
});

/**
 * @route   GET /api/crypto-payment/chain
 * @desc    Retrieves the complete blockchain for public auditing.
 * @access  Public (Read-Only Transparency)
 */
router.get('/chain', (req, res) => {
  /** 
   * 4️⃣ AUDITABILITY:
   * Exporting the full chain for cryptographic verification.
   */
  res.json({ 
    success: true,
    height: blockchain.chain.length, 
    chain: blockchain.chain 
  });
});

module.exports = router;
