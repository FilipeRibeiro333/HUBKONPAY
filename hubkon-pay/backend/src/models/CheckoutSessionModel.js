// src/models/CheckoutSessionModel.js
import mongoose from "mongoose";

const checkoutSessionSchema = new mongoose.Schema({
  buyerCompany: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
  escrow: { type: mongoose.Schema.Types.ObjectId, ref: "Escrow" },
  feeApplied: { type: Number, default: 0 },
  ledgerEntry: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.CheckoutSession || mongoose.model("CheckoutSession", checkoutSessionSchema);