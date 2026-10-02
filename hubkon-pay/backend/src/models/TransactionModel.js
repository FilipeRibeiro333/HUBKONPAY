import mongoose from "mongoose";

/**
 * HUBKON TRANSACTION MODEL (ELITE LEDGER V2.4 - STABLECOIN SELECTOR UPDATE)
 * Enhanced with Layered Security: Status tracking and Timelock release.
 * Expanded validation matrix to accept USD, EUR, CNH, and AOA for global trade routes.
 * Integrates Multi-Rail Orchestration (Solana, EVM, SWIFT, CIPS).
 * Version: V.1041 ORCHESTRATION ELITE ✅
 */

const transactionSchema = new mongoose.Schema(
  {
    from: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Company", 
      default: null 
    },
    to: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Company", 
      default: null 
    },
    company: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Company" 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    
    // 👑 EXPANSÃO MULTIMOEDA (SRO): Adicionado "CNH" (Yuan Offshore) à matriz estrita de validação do MongoDB
    currency: { 
      type: String, 
      enum: ["USD", "EUR", "CNH", "AOA"], 
      default: "USD", 
      required: true,
      uppercase: true,
      trim: true
    },

    // 🎛️ NEW ORCHESTRATION LAYER (O cérebro multi-rail)
    selectedRail: {
      type: String,
      enum: ["SOLANA_WEB3", "EVM_BRIDGE", "SWIFT_BANK", "CIPS_CHINA"],
      default: "SOLANA_WEB3",
      required: true,
      uppercase: true
    },

    // 💰 COMPLIANCE INTEGRATION PATCH: Nova métrica de escolha de stablecoins e metadados aduaneiros
    digitalCurrencyUsed: {
      type: String,
      enum: ["USDC", "EURC", "CNHC", "NONE"],
      default: "USDC",
      uppercase: true
    },

    invoiceFileMeta: {
      type: String,
      default: ""
    },

    // 🏦 NEW OFF-RAMP B2B LAYER: Injetados cirurgicamente os campos de liquidação para IBANs nacionais e internacionais
    targetIBAN: {
      type: String,
      default: null,
      trim: true
    },
    swiftCode: {
      type: String,
      default: null,
      trim: true
    },
    bankName: {
      type: String,
      default: null,
      trim: true
    },

    settlementPartner: {
      type: String,
      default: "HUBKON_LLC_HOLDING",
      trim: true
    },

    invoiceNumber: {
      type: String,
      default: null,
      trim: true
    },

    destinationCountry: {
      type: String,
      default: "Angola",
      trim: true
    },
    // 🛡️ SECURITY LAYER FIELDS (The "Drift Protocol" Fix)
    status: {
      type: String,
      enum: [
        "PENDING_APPROVAL", // Waiting for Multisig (4/7) - Mostra na fila do Dashboard
        "TIMELOCK_ACTIVE",   // Approved but in 24h/48h quarantine
        "ROUTING_ACTIVE",   // 🎛️ Nova camada ativa de orquestração
        "COMPLETED",        // Funds released successfully
        "FAILED",           // Gateway or validation error
        "REVOKED"           // Cancelled by Security Admin/Kill Switch
      ],
      default: "PENDING_APPROVAL" 
    },

    releaseAt: { 
      type: Date, 
      description: "Timestamp when the Timelock expires and funds can be sent" 
    },

    approvals: [
      {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        signedAt: { type: Date, default: Date.now }
      }
    ],

    // 💰 FINANCIAL CALCULATIONS
    feeApplied: { type: Number, default: 0 },
    penaltyApplied: { type: Number, default: 0 },
    bonusApplied: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    relatedEscrow: { type: mongoose.Schema.Types.ObjectId, ref: "Escrow" },

    type: {
      type: String,
      enum: [
        "mint",
        "burn",
        "transfer",
        "staking_reward",
        "staking_reward_total",
        "escrow_created",
        "escrow_approved",
        "escrow_released",
        "platform_fee",
        "penalty_refund",
        "staking_bonus",
        "advance_payout",
        "critical_risk_escrow", 
        "high_risk_payout",
        "fiat_orchestration_routing", // 🎛️ Auditoria das rotas fiduciárias
        "web3_withdrawal",            // ⚡ NOVA INJEÇÃO: Saques directos on-chain por carteiras
        "fiat_offramp_routing"        // ⚡ NOVA INJEÇÃO: Resgates fiduciários para IBANs via parceiros
      ],
      required: true,
    },
    
    // 📡 DUAL-CHAIN WEB3 INTEGRATION LINK
    blockchainHash: {
      type: String,
      default: null,
      trim: true
    },
    
    // Campo de auditoria para o SuperAdmin
    metadata: {
      ip: String,
      userAgent: String,
      riskScore: { type: Number, default: 0 }
    }
  },
  { 
    timestamps: true 
  }
);

// Indexing for faster Timelock, Admin Dashboard, and Explorer query processing
transactionSchema.index({ status: 1, releaseAt: 1 });
transactionSchema.index({ company: 1, createdAt: -1 });
transactionSchema.index({ blockchainHash: 1 }, { sparse: true }); 
transactionSchema.index({ selectedRail: 1, status: 1 }); 

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
