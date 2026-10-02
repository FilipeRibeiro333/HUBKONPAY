/**
 * @file userModel.js
 * @description User Entity & RBAC (Role-Based Access Control) for HUBKON PAY.
 * Version: V.1020 ELITE ✅ (Transaction & Async Safe)
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "O nome é obrigatório"],
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, "O email é obrigatório"], 
      unique: true, 
      lowercase: true, 
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor, use um email válido"]
    },
    password: { 
      type: String, 
      required: [true, "A senha é obrigatória"],
      select: false 
    },
    role: { 
      type: String, 
      default: "user", 
      enum: ["user", "admin", "owner", "superadmin"] 
    },
    walletAddress: { 
      type: String, 
      lowercase: true, 
      trim: true, 
      default: null,
      index: true 
    },
    companyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Company", 
      required: function() { 
        return this.role !== "superadmin"; 
      } 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * @method pre-save
 * @description Hashes password before persisting.
 * ⚡ FIXED: Removed 'next' parameter. Mongoose handles async return automatically.
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    // No next() call here! Promise resolution signals Mongoose to proceed.
  } catch (err) {
    throw err; // Proper way to bubble up errors in async hooks
  }
});

/**
 * @method comparePassword
 * @description Validates credentials.
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
