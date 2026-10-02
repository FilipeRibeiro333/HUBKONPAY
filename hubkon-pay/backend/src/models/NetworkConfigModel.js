import mongoose from "mongoose";

const networkConfigSchema = new mongoose.Schema(
  {
    rail: { type: String, required: true, unique: true, uppercase: true },
    isActive: { type: Boolean, default: true, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

export default mongoose.models.NetworkConfig || mongoose.model("NetworkConfig", networkConfigSchema);
