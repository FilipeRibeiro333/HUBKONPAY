/**
 * @file transaction.js
 * @description Secure Transaction Module for HUBKON PAY.
 * Implements Elliptic Curve Cryptography (ECDSA) for non-repudiation.
 * 
 * @dev Frontier Hackathon Context:
 * This module ensures that B2B payments are tamper-proof. Each transaction 
 * is cryptographically signed by the sender's private key before being 
 * validated by the Hubkon network.
 */

import Elliptic from 'elliptic';
import SHA256 from 'crypto-js/sha256.js';

const EC = Elliptic.ec;
export const ec = new EC('secp256k1'); // Standard curve used by Bitcoin/Ethereum

export class Transaction {
  /**
   * @param {string} from - Sender's Public Key.
   * @param {string} to - Recipient's Public Key.
   * @param {number} amount - Value to be transferred.
   * @param {string} token - Asset identifier (e.g., "HUB", "USDC").
   */
  constructor(from, to, amount, token) {
    this.from = from;       
    this.to = to;           
    this.amount = amount;
    this.token = token;     
    this.timestamp = Date.now();
    this.signature = null;
  }

  /**
   * @notice Generates a unique fingerprint for the transaction data.
   * @returns {string} SHA-256 hash of the transaction body.
   */
  calculateHash() {
    return SHA256(
      this.from + 
      this.to + 
      this.amount + 
      this.token + 
      this.timestamp
    ).toString();
  }

  /**
   * @notice Authorizes the transaction using a private key.
   * @param {Object} signingKey - The EC key pair object.
   */
  signTransaction(signingKey) {
    // SECURITY CHECK: Verify the key belongs to the sender
    if (signingKey.getPublic('hex') !== this.from) {
      throw new Error('AUTHORIZATION_ERROR: Cannot sign transactions for other wallets.');
    }
    
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'hex');
    this.signature = sig.toDER('hex'); // Distinguished Encoding Rules format
  }

  /**
   * @notice Cryptographic verification of the transaction integrity.
   * @returns {boolean} True if the signature matches the public key and data.
   */
  isValid() {
    // SPECIAL CASE: Mining rewards/System transactions (No sender)
    if (this.from === null) return true; 

    if (!this.signature || this.signature.length === 0) {
      throw new Error('VALIDATION_ERROR: Transaction is missing a digital signature.');
    }

    const key = ec.keyFromPublic(this.from, 'hex');
    return key.verify(this.calculateHash(), this.signature);
  }
}
