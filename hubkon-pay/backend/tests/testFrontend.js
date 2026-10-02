// tests/testFrontend.js
// ---------------------------------------------
// HUBKON Pay Frontend → Backend Test (Final Version)
// Ensures rewards are positive for testing purposes
// ---------------------------------------------

import dotenv from "dotenv";
import axios from "axios";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/userModel.js";
import Wallet from "../src/models/walletModel.js";
import Staking from "../src/models/stakingModel.js";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

// Test user credentials
const TEST_USER = {
  email: "testuser@hubkon.com",
  password: "Test1234!"
};

async function ensureTestUser() {
  await connectDB();

  // ----------------------------
  // 1️⃣ Ensure user exists
  // ----------------------------
  let user = await User.findOne({ email: TEST_USER.email });
  if (!user) {
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 12);
    user = new User({
      name: "Test User",
      email: TEST_USER.email,
      password: hashedPassword,
      role: "user"
    });
    await user.save();
    console.log("✅ Test user created with password:", TEST_USER.password);
  } else {
    console.log("ℹ️ Test user already exists:", TEST_USER.email);
  }

  // ----------------------------
  // 2️⃣ Ensure wallet exists
  // ----------------------------
  let wallet = await Wallet.findOne({ userId: user._id });
  if (!wallet) {
    wallet = new Wallet({
      userId: user._id,
      balance: 1000,
      locked: 0,
      currency: "USD"
    });
    await wallet.save();
    console.log("✅ Wallet created with 1000 USD");
  }

  // ----------------------------
  // 3️⃣ Ensure staking exists with positive rewards
  // ----------------------------
  let stake = await Staking.findOne({ userId: user._id, active: true });
  if (!stake) {
    const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
    stake = new Staking({
      userId: user._id,
      amount: 200,
      rewardRate: 0.05,
      claimed: false,
      active: true,
      startDate: new Date(Date.now() - TEN_DAYS_MS) // ensures positive rewards
    });
    await stake.save();
    console.log("✅ Active staking created with startDate 10 days ago");
  }

  return user;
}

async function runTests() {
  const user = await ensureTestUser();

  // ----------------------------
  // 4️⃣ Login
  // ----------------------------
  let token;
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    token = loginRes.data.token;
    console.log("✅ Login successful, token obtained");
  } catch (err) {
    console.error("❌ Login failed:", err.response?.data || err.message);
    process.exit(1);
  }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // ----------------------------
  // 5️⃣ Fetch wallet balance
  // ----------------------------
  try {
    const walletRes = await axios.get(`${BASE_URL}/wallet/${user._id}`, authHeader);
    console.log("💰 Wallet balance:", walletRes.data);
  } catch (err) {
    console.error("❌ Wallet fetch failed:", err.response?.data || err.message);
  }

  // ----------------------------
  // 6️⃣ Claim staking rewards
  // ----------------------------
  try {
    const claimRes = await axios.post(`${BASE_URL}/staking/claim`, { userId: user._id }, authHeader);
    console.log("🎯 Staking rewards claimed:", claimRes.data);
  } catch (err) {
    console.error("❌ Claim rewards failed:", err.response?.data || err.message);
  }

  process.exit();
}

runTests();