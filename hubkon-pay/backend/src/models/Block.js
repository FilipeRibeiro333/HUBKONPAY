import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  transactions: { type: Array, default: [] },
  previousHash: { type: String, required: true },
  hash: { type: String, required: true },
  nonce: { type: Number, required: true },
  miner: { type: String },
  reward: { type: Number, default: 0 }
}, { versionKey: false });

const Block = mongoose.models.Block || mongoose.model('Block', blockSchema);
export default Block;