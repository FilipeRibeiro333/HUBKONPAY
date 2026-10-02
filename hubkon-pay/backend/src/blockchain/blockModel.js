/**
 * @file blockModel.js
 * @description Data Schema for Persistent Ledger Blocks.
 * Ensures the Hubkon Blockchain history is stored with strict integrity.
 * 
 * @dev Frontier Hackathon Context:
 * This model implements a "Tamper-Proof" local ledger. It mirrors the 
 * on-chain state to provide fast B2B auditing and transparency.
 */

const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  index: { 
    type: Number, 
    required: true,
    index: true // Optimized for fast block lookups
  },
  timestamp: { 
    type: Number, 
    required: true 
  },
  transactions: { 
    type: Array, 
    default: [],
    required: true 
  },
  previousHash: { 
    type: String, 
    required: true 
  },
  hash: { 
    type: String, 
    required: true,
    unique: true // No two blocks can have the same hash
  },
}, { versionKey: false });

/**
 * STRICT SCHEMA ENFORCEMENT
 * Prevents unknown fields from being injected into the block.
 */
blockSchema.set('strict', true);

/**
 * 🔐 IMMUTABILITY MIDDLEWARE (Write-Once Logic)
 * @notice Crucial for Financial Integrity.
 * Throws an error if any attempt is made to modify an existing block.
 */
blockSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('IMMUTABILITY VIOLATION: Blocks cannot be modified after creation.'));
  }
  next();
});

const Block = mongoose.model('Block', blockSchema);

module.exports = Block;
