/**
 * @file wallet.js
 * @description Corporate Wallet Entity for the HUBKON Ecosystem.
 * Manages asymmetric key pairs and internal accounting for B2B liquidity.
 * 
 * @dev Frontier Hackathon Context:
 * This module bridges Web2 identity with Web3 assets. It tracks 
 * available balance, locked staking volume, and accumulated rewards.
 */

import { ec } from './transaction.js';

export class Wallet {
  /**
   * @param {string} name - Human-readable identifier (e.g., Company Name).
   */
  constructor(name) {
    this.name = name;
    
    // GENERATING ASYMMETRIC IDENTITY
    // We use secp256k1 to ensure compatibility with major Web3 standards.
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic('hex');
    
    // INTERNAL LEDGER ACCOUNTING
    this.balance = 0; // Available liquidity for B2B payments
    this.stake = 0;   // Capital locked to secure the network/earn yield
    this.rewards = 0; // Accumulated staking interest
  }

  /**
   * @notice Increases liquidity (e.g., via deposit or payment receipt).
   */
  addBalance(amount) {
    this.balance += amount;
  }

  /**
   * @notice Processes outgoing payments with strict solvency checks.
   */
  subtractBalance(amount) {
    if (amount > this.balance) {
      throw new Error('INSUFFICIENT_FUNDS: Transaction amount exceeds available balance.');
    }
    this.balance -= amount;
  }

  /**
   * @notice Locks capital into the Hubkon Staking Engine.
   * @dev This reduces immediate liquidity to prioritize long-term yield.
   */
  addStake(amount) {
    if (amount > this.balance) {
      throw new Error('STAKING_ERROR: Insufficient balance to lock funds.');
    }
    this.balance -= amount;
    this.stake += amount;
  }

  /**
   * @returns {number} Total spendable balance.
   */
  getBalance() {
    return this.balance;
  }

  /**
   * @returns {number} Total capital currently earning yield.
   */
  getStake() {
    return this.stake;
  }
}
