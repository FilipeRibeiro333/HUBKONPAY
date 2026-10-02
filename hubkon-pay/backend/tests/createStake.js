// tests/createStake.js
// ---------------------------------------------
// Script to create a full test environment for staking frontend tests
// - Creates test user with hashed password
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

async function createStakeEnvironment() {
  await connectDB();
  console.log("🚀 Connected to MongoDB");

  // 1️⃣ Create test user with known login
  const email = "testuser@hubkon.com";
  const passwordPlain = "Test1234!";
  let user = await User.findOne({ email });

  if (!user) {
    const hashedPassword = await bcrypt.hash(passwordPlain, 12);
    user = new User({
      name: "Test User",
      email,
      password: hashedPassword,
      role: "user",
    });
    await user.save();
    console.log("✅ Test user created:", email, passwordPlain);
  } else {
    console.log("ℹ️ Test user already exists:", email);
  }

  // 2️⃣ Create wallet for the user (if not exists)
  let wallet = await Wallet.findOne({ userId: user._id });
  if (!wallet) {
    const companyId = new mongoose.Types.ObjectId("69b21f036f1431a3c57cbee0"); // replace with real companyId
    wallet = new Wallet({
      userId: user._id,
      companyId,
      balance: 1000,  // numeric balance to prevent NaN
      locked: 0,
      currency: "USD",
    });
    await wallet.save();
    console.log("✅ Wallet created:", wallet._id);
  } else {
    console.log("ℹ️ Wallet already exists:", wallet._id);
  }

  // 3️⃣ Create staking entry linked to this user
  const stake = new Staking({
    userId: user._id,
    amount: 200,
    rewardRate: 0.05,  // 5% APY
    claimed: false,
    active: true,
    startDate: new Date(), // ensures claimReward calculation works
  });
  await stake.save();
  console.log("✅ Stake created successfully:", stake._id);

  console.log("🎉 Test staking environment ready!");
  console.log("ℹ️ Login credentials for frontend test:");
  console.log("Email:", email);
  console.log("Password:", passwordPlain);

  process.exit();
}

createStakeEnvironment();