// tests/createTestEnvironment.js
// ---------------------------------------------
// Script to create a full test environment for HUBKON Pay
// - Creates a test user with hashed password
// - Creates a wallet linked to a company
// - Creates a staking record with rewardRate and startDate
// - Ensures numeric balances to avoid NaN errors
// ---------------------------------------------

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/userModel.js";
import Wallet from "../src/models/walletModel.js";
import Staking from "../src/models/stakingModel.js";

dotenv.config();

async function createTestEnvironment() {
  await connectDB();

  console.log("🚀 Connected to MongoDB");

  // 1️⃣ Create test user with hashed password
  const passwordPlain = "Test1234!";
  const hashedPassword = await bcrypt.hash(passwordPlain, 12);

  const testUser = new User({
    name: "Test User",
    email: "testuser@hubkon.com",
    password: hashedPassword,
    role: "user"
  });
  await testUser.save();
  console.log("✅ Test user created:", testUser._id);
  console.log("ℹ️ Test login credentials:", testUser.email, passwordPlain);

  // 2️⃣ Link wallet to an existing company
  const companyId = new mongoose.Types.ObjectId("69b21f036f1431a3c57cbee0"); // replace with real companyId

  const wallet = new Wallet({
    userId: testUser._id,
    companyId,
    balance: 1000,  // numeric balance to prevent NaN
    locked: 0,
    currency: "USD"
  });
  await wallet.save();
  console.log("✅ Wallet created:", wallet._id);

  // 3️⃣ Create staking record
  const stake = new Staking({
    userId: testUser._id,
    amount: 200,
    rewardRate: 0.05,  // 5% APY
    claimed: false,
    active: true,
    startDate: new Date()  // ensures claimReward calculation works
  });
  await stake.save();
  console.log("✅ Stake created:", stake._id);

  console.log("🎉 Test environment setup complete!");
  process.exit();
}

createTestEnvironment();