/**
 * @file blockchain.js
 * @description Core Sovereign Ledger Implementation for HUBKON PAY.
 * Implements a Proof-of-Work (PoW) consensus simulation for B2B transaction finality.
 * 
 * @dev Frontier Hackathon Context:
 * "The Immutability Layer". This module demonstrates the architectural 
 * foundation of a private/hybrid ledger used for enterprise auditing 
 * and settlement tracking.
 */

import crypto from "crypto";

/**
 * @class Block
 * @description Defines the structure and hashing logic for an individual ledger entry.
 */
class Block {
  constructor(index, timestamp, transactions, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions; // B2B Payment metadata
    this.previousHash = previousHash; // Cryptographic link to parent
    this.nonce = 0; // Number used once for mining difficulty
    this.hash = this.calculateHash();
  }

  /**
   * @notice Generates a SHA-256 fingerprint of the block's entire state.
   * @returns {string} Hexadecimal hash string.
   */
  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce
      )
      .digest("hex");
  }

  /**
   * @notice Implements the Proof-of-Work (PoW) algorithm.
   * @param {number} difficulty - Number of leading zeros required for the hash.
   */
  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join("0");
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

/**
 * @class Blockchain
 * @description Manages the chain state, consensus rules, and the transaction mempool.
 */
class Blockchain {
  constructor() {
    // Initializing the chain with the immutable Genesis Block
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Adjustable network difficulty
    this.pendingTransactions = []; // The Mempool
  }

  /**
   * @notice Creates the hardcoded starting point of the sovereign ledger.
   */
  createGenesisBlock() {
    return new Block(0, Date.now(), [], "0");
  }

  /**
   * @returns {Block} The most recently validated block in the chain.
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * @notice Queues a new B2B transaction for the next mining cycle.
   */
  addTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  /**
   * @notice Seals the pending mempool into a new cryptographic block.
   * @returns {Block|null} The mined block or null if the mempool is empty.
   */
  minePendingTransactions() {
    if (this.pendingTransactions.length === 0) return null;

    const block = new Block(
      this.chain.length,
      Date.now(),
      [...this.pendingTransactions], // Capturing current state
      this.getLatestBlock().hash
    );

    // Executing the consensus proof
    block.mineBlock(this.difficulty);
    
    this.chain.push(block);
    this.pendingTransactions = []; // Clearing the mempool after settlement
    
    return block;
  }
}

// Exporting a singleton instance to maintain global ledger state
export default new Blockchain();
