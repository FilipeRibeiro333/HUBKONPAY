import mongoose from "mongoose";

// 📜 Sub-schema para o histórico de auditoria
const eventLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // ex: "approved_by_buyer", "funds_released"
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  details: { type: String } // ex: "IP: 192.168.1.1"
});

const conditionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  status: { type: String, enum: ["pending", "fulfilled"], default: "pending" },
});

const escrowSchema = new mongoose.Schema({
  companyA: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  companyB: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  
  amount: { type: Number, required: true },
  
  // 🌍 Suporte a moedas (USD/EUR) para o teu lucro internacional
  currency: { type: String, enum: ["USD", "EUR", "AOA"], default: "USD" },

  conditions: [conditionSchema],

  approvals: {
    buyerApproved: { type: Boolean, default: false },
    sellerApproved: { type: Boolean, default: false },
    buyerApprovedAt: { type: Date }, // 🕒 Auditoria temporal
    sellerApprovedAt: { type: Date }
  },

  // 📝 HISTÓRICO DE AUDITORIA (O que faltava!)
  history: [eventLogSchema],

  status: {
    type: String,
    enum: ["pending", "approved", "released", "cancelled"],
    default: "pending",
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  createdAt: { type: Date, default: Date.now },
  releasedAt: { type: Date },
});

export default mongoose.models.Escrow || mongoose.model("Escrow", escrowSchema);
