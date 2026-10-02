/**
 * @file seedAdmin.js
 * @description Root Administrative Provisioning Script for HUBKON PAY.
 * 
 * @dev Frontier Hackathon Context:
 * This script establishes the "Root of Trust". The Superadmin created here 
 * will be the primary authority to deploy and manage the HubkonID (SBT) 
 * Smart Contracts on the Solana/Polygon network.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/userModel.js"; // Standardizing path

dotenv.config();

/**
 * Re-plants the Superadmin into the system.
 * @notice We send the password in plain text because the userSchema.pre("save") 
 * hook handles the Bcrypt encryption automatically.
 */
const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Missing MONGO_URI in environment variables");
    }

    // 1️⃣ Database Handshake
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Connected for Admin Seeding...");

    const adminEmail = "admin@hubkon.com";

    // 2️⃣ Clean up existing admin to prevent unique constraint errors
    await User.deleteMany({ email: adminEmail });

    // 3️⃣ Creating the Global Superadmin
    // This role bypasses companyId requirements as per your userModel.js logic
    const admin = await User.create({
      name: "Madié Hubkon",
      email: adminEmail,
      password: "HubkonAdmin2026!", 
      role: "superadmin",
      walletAddress: null // Future: Linking to the Main Admin Wallet
    });

    console.log("\n============================================");
    console.log("👑      SUPERADMIN PROVISIONED (SUCCESS)    ");
    console.log("============================================");
    console.log(`👤 Identity: ${admin.name}`);
    console.log(`📧 Login:    ${admin.email}`);
    console.log(`🛡️ Role:     ${admin.role.toUpperCase()}`);
    console.log("============================================\n");

    // 4️⃣ Graceful shutdown
    await mongoose.disconnect();
    console.log("👋 DB Disconnected. Ready for production testing.");
    process.exit(0);
  } catch (err) {
    console.error("❌ [SEED CRITICAL ERROR]:", err.message);
    process.exit(1);
  }
};

seedAdmin();
