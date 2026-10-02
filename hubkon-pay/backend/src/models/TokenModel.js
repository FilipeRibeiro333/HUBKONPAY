// src/models/TokenModel.js
import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

const Token = mongoose.model('Token', tokenSchema);

export default Token;