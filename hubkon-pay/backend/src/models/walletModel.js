// src/models/WalletModel.js

import mongoose from "mongoose";

/**
 * Wallet Model
 * One wallet per company
 * Platform wallet is separate
 */
const walletSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return !this.isPlatform;
      },
      unique: true,
      sparse: true // ✅ avoids duplicate null issue
    },
    balance: { type: Number, default: 0 },
    locked: { type: Number, default: 0 },
    isPlatform: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Wallet ||
  mongoose.model("Wallet", walletSchema);