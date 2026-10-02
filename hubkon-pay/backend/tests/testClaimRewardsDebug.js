// tests/testClaimRewardsDebugFull.js
// =====================================
// HUBKON Pay Backend Debug Test (non-intrusive)
// Does NOT modify controller or services
// Focus: claim rewards + full response inspection
// =====================================

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/userModel.js";
import Wallet from "../src/models/walletModel.js";
import Staking from "../src/models/stakingModel.js";
import axios from "axios";

dotenv.config();
const BASE_URL = "http://localhost:5000/api";

// Test user credentials
const TEST_USER = {
  name: "Test User",
  email: "testuser@hubkon.com",
  password: "Test1234!",
  role: "user",
};

async function ensureTestUser() {
  await connectDB();

  let user = await User.findOne({ email: TEST_USER.email });
  if (!user) {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 12);
    user = new User({ name: TEST_USER.name, email: TEST_USER.email, password: hashedPassword, role: TEST_USER.role });
    await user.save();
    console.log("✅ Test user created with password:", TEST_USER.password);
  } else {
    console.log("ℹ️ Test user already exists:", TEST_USER.email);
  }

  let wallet = await Wallet.findOne({ userId: user._id });
  if (!wallet) {
    wallet = new Wallet({ userId: user._id, balance: 1000, locked: 0, currency: "USD" });
    await wallet.save();
    console.log("✅ Wallet created with 1000 USD");
  }

  // Ensure staking exists with startDate 10 days ago
  let stake = await Staking.findOne({ userId: user._id, active: true });
  if (!stake) {
    const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
    stake = new Staking({
      userId: user._id,
      amount: 200,
      rewardRate: 0.05,
      claimed: false,
      active: true,
      startDate: new Date(Date.now() - TEN_DAYS_MS),
    });
    await stake.save();
    console.log("✅ Active staking created with startDate 10 days ago");
  }

  return user;
}

async function runClaimRewardsDebug() {
  try {
    const user = await ensureTestUser();

    console.log("🚀 Logging in to get JWT token...");

    // 1️⃣ Login to get token
    let token;
    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      token = loginRes.data.token;
      console.log("✅ Login successful, token obtained");
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      process.exit(1);
    }

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 2️⃣ Fetch wallet for debug
    try {
      const walletRes = await axios.get(`${BASE_URL}/wallet/${user._id}`, authHeader);
      console.log("💰 Wallet data:", walletRes.data);
    } catch (err) {
      console.error("❌ Wallet fetch failed:", err.response?.data || err.message);
    }

    // 3️⃣ Attempt claim rewards
    try {
      const claimRes = await axios.post(`${BASE_URL}/staking/claim`, { userId: user._id.toString() }, authHeader);

      console.log("🎯 Claim rewards response full object:");
      console.log("Status:", claimRes.status);
      console.log("Headers:", claimRes.headers);
      console.log("Data:", claimRes.data);

      if (!claimRes.data.success) {
        console.warn("⚠️ Claim rewards failed, inspect backend logs or data above.");
      }
    } catch (err) {
      if (err.response) {
        console.error("🔥 Claim rewards HTTP error:");
        console.error("Status:", err.response.status);
        console.error("Headers:", err.response.headers);
        console.error("Data:", err.response.data);
      } else {
        console.error("🔥 Claim rewards network/error:", err.message);
      }
    }

  } catch (err) {
    console.error("❌ Test failed:", err.message);
  } finally {
    process.exit();
  }
}

runClaimRewardsDebug();