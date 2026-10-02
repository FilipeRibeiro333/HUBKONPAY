/**
 * @file companyModel.js
 * @description Enterprise Tenant Model for HUBKON PAY. 
 * Versão V.1025: Otimizada para Paywall Inteligente e Turbo Advance.
 */
import mongoose from "mongoose";
import crypto from "crypto";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  taxId: { type: String, unique: true, sparse: true },
  address: { type: String, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  apiKey: { type: String, unique: true, default: () => crypto.randomUUID() },

  // 🏢 SAAS ENGINE (Planos & Mensalidades)
  // Ajustado: Plano inicial como 'pro' ou 'basic' conforme sua estratégia
  plan: { 
    type: String, 
    enum: ["basic", "pro", "enterprise"], 
    default: "pro" 
  },
  subscriptionStatus: { 
    type: String, 
    enum: ["active", "expired", "past_due", "canceled"], 
    default: "active" 
  },
  subscriptionExpiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
  },

  // 🛰️ WEBHOOK CONFIGURATION
  webhookUrl: { type: String, default: null },
  webhookSecret: { type: String, default: () => crypto.randomBytes(20).toString('hex') },

  // 🛡️ REPUTATION & RISK ENGINE (The 10M Brain)
  creditScore: { type: Number, default: 75, min: 0, max: 100 }, // Aumentado default para teste
  successfulEscrows: { type: Number, default: 0 },
  disputedEscrows: { type: Number, default: 0 },
  totalVolumeUSD: { type: Number, default: 0 },

  // 🚦 ADVANCE PAYMENT CONTROL (Turbo Advance)
  // Este campo agora serve como uma trava administrativa manual além do plano
  isEligibleForAdvance: { 
    type: Boolean, 
    default: true // Permitir por padrão para facilitar o seu vídeo de demo
  },
  maxAdvanceLimit: { 
    type: Number, 
    default: 10000 // Aumentado para suportar contratos de 5k USD
  },

  // 📈 HISTÓRICO DE TAXAS CUSTOMIZADAS (Opcional - Caso queira taxas por empresa)
  customFeeRate: { type: Number, default: null } 

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * @virtual canUseTurbo
 * @description Verifica em tempo real se a empresa pode usar o Turbo Advance
 */
companySchema.virtual('canUseTurbo').get(function() {
  return this.plan === 'enterprise' && this.subscriptionStatus === 'active' && this.isEligibleForAdvance;
});

const Company = mongoose.models.Company || mongoose.model("Company", companySchema);

export default Company;
