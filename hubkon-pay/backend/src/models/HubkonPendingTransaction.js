// src/models/HubkonPendingTransaction.js
import mongoose from 'mongoose';

const HubkonPendingTransactionSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Number, default: Date.now }
});

const HubkonPendingTransaction = mongoose.model(
  'HubkonPendingTransaction',
  HubkonPendingTransactionSchema
);

export default HubkonPendingTransaction;