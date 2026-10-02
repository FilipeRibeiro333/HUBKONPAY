/**
 * @file cryptoService.js
 * @description Digital Signature & Verification Engine for HUBKON PAY.
 * Implements RSA/ECDSA signing to ensure non-repudiation and transaction integrity.
 * 
 * @dev Frontier Hackathon Context:
 * "The Security Anchor". This module ensures that B2B transactions cannot be 
 * forged. It provides the cryptographic evidence required for the 
 * Hubkon Sovereign Ledger to validate actor intent.
 */

const crypto = require('crypto');

/**
 * @function signTransaction
 * @description Signs a transaction payload using the sender's private key.
 * @param {Object} transaction - The B2B transaction or Escrow data to be signed.
 * @param {string} privateKey - The sender's PEM-encoded private key.
 * @returns {string} Hexadecimal digital signature.
 */
function signTransaction(transaction, privateKey) {
  const sign = crypto.createSign('SHA256');
  
  /** 
   * DATA CANONICALIZATION:
   * We stringify the payload to create a deterministic hash for signing.
   */
  sign.update(JSON.stringify(transaction)).end();
  
  const signature = sign.sign(privateKey, 'hex');
  return signature;
}

/**
 * @function verifyTransaction
 * @description Validates a digital signature against the provided public key.
 * @param {Object} transaction - The original transaction data.
 * @param {string} signature - The signature to be verified.
 * @param {string} publicKey - The sender's PEM-encoded public key.
 * @returns {boolean} True if the signature is authentic and the data is untampered.
 */
function verifyTransaction(transaction, signature, publicKey) {
  const verify = crypto.createVerify('SHA256');
  
  verify.update(JSON.stringify(transaction)).end();
  
  /** 
   * CRYPTOGRAPHIC VERIFICATION:
   * Ensuring the data matches the signature issued by the private key holder.
   */
  return verify.verify(publicKey, signature, 'hex');
}

module.exports = { 
  signTransaction, 
  verifyTransaction 
};
