/**
 * 🏛️ HUBKON BLOCKCHAIN - MASTER LEDGER (V.1005)
 * Stores immutable blocks signed by the Validator Node.
 */
import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  transactions: { type: Array, default: [] },
  nonce: { type: Number, required: true, default: 0 },
  
  // 🔗 INTEGRIDADE (O que liga os blocos)
  hash: { type: String, required: true },
  previousHash: { type: String, required: true },

  // 🛡️ SOBERANIA (O Selo do Nó Validador)
  // Sem isto, a blockchain é apenas uma lista. Com isto, é um BANCO.
  validatorSignature: { type: String, required: true }, 
  validatorId: { type: String, default: "HUBKON_VALIDATOR_01" },
  
  // Auditoria de Mineração
  minerReward: { type: Number, default: 0 }
}, { timestamps: true });

// Previne erros de re-compilação do modelo no Node.js
const Block = mongoose.models.Block || mongoose.model('Block', blockSchema);
export default Block;
