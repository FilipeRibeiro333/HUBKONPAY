/**
 * @file blockchain.js
 * @description Core Ledger Engine for HUBKON PAY.
 * Implements a Proof-of-Stake (PoS) & Proof-of-Work (PoW) hybrid simulation 
 * for B2B transaction settlement and staking rewards.
 * 
 * @dev Frontier Hackathon Context:
 * This engine demonstrates the flow of funds, block validation, and 
 * the distribution of yields (Staking) to corporate partners.
 */

import crypto from 'crypto';
import { Transaction } from './transaction.js';
import { Wallet } from './wallet.js';

export class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.stakers = [];
    this.miningReward = 50; // Base reward for network maintainers
  }

  /**
   * @returns {Object} The most recently added block in the chain.
   */
  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * @notice Validates and queues a new B2B transaction.
   * @param {Transaction} transaction - The transaction object to be added.
   */
  addTransaction(transaction) {
    if (!transaction.from || !transaction.to || !transaction.amount) {
      throw new Error('Invalid Transaction: Missing required fields');
    }
    if (!transaction.isValid()) {
      throw new Error('Invalid Transaction: Signature verification failed');
    }
    this.pendingTransactions.push(transaction);
  }

  /**
   * @notice Registers a wallet for the Staking Yield program.
   * @param {Wallet} wallet - The corporate wallet to receive rewards.
   */
  addStaker(wallet) {
    if (!this.stakers.includes(wallet)) {
      this.stakers.push(wallet);
    }
  }

  /**
   * @notice Seals pending transactions into a block using a PoW consensus simulation.
   * @param {Wallet} minerWallet - The wallet performing the validation.
   */
  minePendingTransactions(minerWallet) {
    const block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
      previousHash: this.getLastBlock() ? this.getLastBlock().hash : '0',
      nonce: 0,
    };

    // Implementation of a simple Proof-of-Work (PoW) algorithm
    let hash = this.calculateHash(block);
    while (!hash.startsWith('000')) {
      block.nonce++;
      hash = this.calculateHash(block);
    }
    block.hash = hash;

    this.chain.push(block);

    // Miner reward distribution
    minerWallet.addBalance(this.miningReward);

    /**
     * STAKING REWARDS LOGIC
     * Distributes a portion of the block reward to active stakers 
     * based on their network participation percentage.
     */
    this.stakers.forEach(s => {
      const reward = this.miningReward * (s.stake / 100);
      s.rewards += reward;
    });

    this.pendingTransactions = [];
    console.log(`⛏️ Block Mined successfully by: ${minerWallet.name}`);
    console.log(block);
  }

  /**
   * @notice Generates a SHA-256 hash for block integrity.
   */
  calculateHash(block) {
    return crypto
      .createHash('sha256')
      .update(
        block.index +
        block.previousHash +
        block.timestamp +
        JSON.stringify(block.transactions) +
        block.nonce
      )
      .digest('hex');
  }

  /**
   * @notice Integrity check for the entire ledger.
   * @returns {boolean} True if the chain has not been tampered with.
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      
      const hashCheck = this.calculateHash(current);
      
      if (current.hash !== hashCheck || current.previousHash !== previous.hash) {
        return false;
      }
    }
    return true;
  }
}

// Global Singleton for Application State
const blockchain = new Blockchain();
export default blockchain;
