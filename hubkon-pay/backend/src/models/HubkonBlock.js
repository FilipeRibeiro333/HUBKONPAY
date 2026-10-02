// src/models/HubkonBlock.js
import mongoose from 'mongoose';

const HubkonBlockSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  transactions: { type: Array, required: true },
  previousHash: { type: String, required: true },
  nonce: { type: Number, required: true },
  hash: { type: String, required: true }
});

const HubkonBlock = mongoose.model('HubkonBlock', HubkonBlockSchema);

export default HubkonBlock;