import mongoose from "mongoose";

const KYCProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  fullName: String,
  dateOfBirth: Date,
  nationalId: String,
  address: String,
  country: String,

  documentFront: String,
  documentBack: String,
  selfie: String,

  kycStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  riskScore: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("KYCProfile", KYCProfileSchema);