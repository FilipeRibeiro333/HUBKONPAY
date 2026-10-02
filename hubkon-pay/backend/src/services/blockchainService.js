/**
 * @file blockchainTransactionService.js
 * @description Sovereign Validator Engine & Block Sealing Service.
 * Implements digital signatures for block finality and non-repudiation.
 * 
 * @dev Frontier Hackathon Context:
 * "The Judge's Seal". This module ensures that every block in the Hubkon 
 * Sovereign Ledger is cryptographically signed by a verified validator node.
 */

import crypto from "crypto";
import blockchain from "../utils/blockchain.js";
import Block from "../models/BlockModel.js";

/**
 * @function generateValidatorSignature
 * @description Generates a HMAC SHA-256 signature for a specific block hash.
 * @param {string} blockHash - The unique identifier of the mined block.
 * @returns {string} The cryptographic seal of the Hubkon Validator.
 */
const generateValidatorSignature = (blockHash) => {
  // Security: In production, this secret is managed by a Hardware Security Module (HSM)
  const secret = process.env.VALIDATOR_SECRET || "HUBKON_SECRET_KEY_PROD_10M";
  return crypto
    .createHmac("sha256", secret)
    .update(blockHash)
    .digest("hex");
};

/**
 * @function createBlockchainTransaction
 * @description Orchestrates the transaction lifecycle: Log -> Mine -> Sign -> Persist.
 * @param {Object} data - Transaction payload (B2B Settlement / Escrow data).
 * @returns {Promise<Object>} The finalized and sealed blockchain block.
 */
export const createBlockchainTransaction = async (data) => {
  try {
    /** 
     * 1. TRANSACTION LOGGING
     * Creating a unique fingerprint for the inbound B2B transaction.
     */
    const log = {
      ...data,
      timestamp: Date.now(),
      hash: crypto
        .createHash("sha256")
        .update(JSON.stringify(data) + Date.now())
        .digest("hex"),
    };

    /** 
     * 2. MEMPOOL & MINING
     * Adding the log to the pending pool and executing the consensus algorithm.
     */
    blockchain.addTransaction(log);
    const minedBlockData = blockchain.minePendingTransactions();

    if (minedBlockData) {
      /** 
       * 3. VALIDATOR ENDORSEMENT
       * The Hubkon Node signs the mined block to guarantee authenticity.
       */
      const signature = generateValidatorSignature(minedBlockData.hash);

      /** 
       * 4. IMMUTABLE PERSISTENCE
       * Storing the block with the digital signature and validator ID.
       * This creates a verifiable audit trail for corporate clients.
       */
      const finalBlock = await Block.create({
        index: minedBlockData.index,
        timestamp: minedBlockData.timestamp,
        transactions: minedBlockData.transactions,
        previousHash: minedBlockData.previousHash,
        hash: minedBlockData.hash,
        nonce: minedBlockData.nonce,
        validatorSignature: signature, // Proof of Hubkon validation
        validatorId: "HUBKON_NODE_MAINNET_01"
      });

      console.log(`⛓️ [LEDGER] Block #${finalBlock.index} successfully SEALED and PERSISTED.`);
      return finalBlock;
    }
  } catch (err) {
    console.error("❌ [LEDGER_CRITICAL_ERROR]:", err.message);
    throw new Error("BLOCKCHAIN_SETTLEMENT_FAILED");
  }
};
