import mongoose from "mongoose";

/**
 * Staking linked to company
 */

const stakingSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional audit
    },
    amount: { type: Number, required: true },
    rewardRate: { type: Number, default: 0.05 },
    active: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Staking ||
  mongoose.model("Staking", stakingSchema);