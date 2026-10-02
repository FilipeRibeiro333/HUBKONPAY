// src/models/Transfer.js
/**
 * Transfer Model
 * --------------------------
 * Represents an external transfer request.
 */

import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  destinationType: {
    type: String, // bank, crypto, etc.
    required: true,
  },
  destinationAccount: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  externalId: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model('Transfer', transferSchema);