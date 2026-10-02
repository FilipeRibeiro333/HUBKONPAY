/**
 * @file blockchainController.js
 * @description Consensus Engine & Block Orchestrator for HUBKON PAY.
 * Implements a Proof-of-Work (PoW) simulation for B2B transaction finality.
 * 
 * @dev Frontier Hackathon Context:
 * This controller manages the "Mempool" (Pending Transactions) and 
 * the creation of new blocks, showcasing the Hubkon Sovereign Ledger logic.
 */

import HubkonBlock from '../models/HubkonBlock.js';
import HubkonPendingTransaction from '../models/HubkonPendingTransaction.js';
import crypto from 'crypto';

/**
 * @function calculateHash
 * @description Generates a SHA-256 fingerprint for block integrity.
 */
function calculateHash(index, previousHash, timestamp, transactions, nonce) {
  const data = index + previousHash + timestamp + JSON.stringify(transactions) + nonce;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * @function createTransaction
 * @description Queues a new B2B payment into the pending mempool.
 */
export async function createTransaction(sender, recipient, amount) {
  const tx = await HubkonPendingTransaction.create({
    sender,
    recipient,
    amount
  });
  return tx;
}

/**
 * @function getTransactions
 * @description Retrieves all queued transactions awaiting validation.
 */
export async function getTransactions() {
  return await HubkonPendingTransaction.find();
}

/**
 * @function getLastBlock
 * @description Fetches the most recent block to link the next hash in the chain.
 */
async function getLastBlock() {
  const lastBlock = await HubkonBlock.findOne().sort({ index: -1 });
  return lastBlock;
}

/**
 * @function createBlock
 * @description Seals the pending mempool into a cryptographic block.
 * @param {string} minerEmail - Identity of the validator node to receive rewards.
 */
export async function createBlock(minerEmail) {
  const pendingTxs = await HubkonPendingTransaction.find();

  if (pendingTxs.length === 0) {
    throw new Error('MEMPOOL_EMPTY: No pending transactions to mine.');
  }

  const lastBlock = await getLastBlock();
  const previousHash = lastBlock ? lastBlock.hash : '0';
  const index = lastBlock ? lastBlock.index + 1 : 1;
  const timestamp = Date.now();

  /**
   * NETWORK REWARD LOGIC
   * Incentivizes node maintenance by issuing a system-level payout.
   */
  pendingTxs.push({
    sender: 'HUBKON_SYSTEM',
    recipient: minerEmail,
    amount: 50, // Fixed validation reward
    timestamp
  });

  /**
   * PROOF-OF-WORK SIMULATION (Difficulty: 3)
   * Ensures computational effort is required to finalize the ledger.
   */
  let nonce = 0;
  let hash = calculateHash(index, previousHash, timestamp, pendingTxs, nonce);
  const difficulty = 3; 
  
  while (!hash.startsWith('0'.repeat(difficulty))) {
    nonce++;
    hash = calculateHash(index, previousHash, timestamp, pendingTxs, nonce);
  }

  // Persisting the immutable block
  const newBlock = await HubkonBlock.create({
    index,
    timestamp,
    transactions: pendingTxs,
    previousHash,
    nonce,
    hash
  });

  // Atomic cleanup of the mempool after successful settlement
  await HubkonPendingTransaction.deleteMany();

  return newBlock;
}

/**
 * @function getChain
 * @description Exports the complete ledger for public auditing.
 */
export async function getChain() {
  return await HubkonBlock.find().sort({ index: 1 });
}
