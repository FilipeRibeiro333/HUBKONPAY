
import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  key: { type: String, required: true, unique: true }
}, { timestamps: true });

// ⚠️ Força a coleção exata 'apikeys' no MongoDB
const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema, 'apikeys');

export default ApiKey;