// testDashboardFull.js
// ---------------------------------------------
// Test script for HUBKON Dashboard
// Ensures company, wallet, and transactions exist
// Uses Super Admin fixed _id to avoid CastError
// ---------------------------------------------

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Company from "./src/models/companyModel.js";
import Wallet from "./src/models/walletModel.js";
import Transaction from "./src/models/transactionModel.js";
import User from "./src/models/userModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hubkon";

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // -----------------------------
    // 1️⃣ Create Super Admin (fixed _id)
    // -----------------------------
    const superAdminId = "69a6bbd092be061a613edb4d";
    let user = await User.findById(superAdminId);
    if (!user) {
      user = new User({
        _id: superAdminId,
        name: "Super Admin",
        email: "superadmin@hubkon.com",
        password: "$2b$12$C4sw6i/H3Lt7ekcOnD4tqetkD43kj4GjJ/xJ/GU8CgHvr7vOmnOPW", // 12345678
      });
      await user.save();
      console.log("✅ Test user created");
    }

    // -----------------------------
    // 2️⃣ Create Company
    // -----------------------------
    let company = await Company.findOne({ owner: superAdminId });
    if (!company) {
      company = new Company({
        name: "Test Company",
        email: "company@hubkon.com",
        owner: superAdminId,
      });
      await company.save();
      console.log("✅ Test company created");
    }

    // -----------------------------
    // 3️⃣ Create Wallet
    // -----------------------------
    let wallet = await Wallet.findOne({ userId: superAdminId });
    if (!wallet) {
      wallet = new Wallet({
        userId: superAdminId,
        balance: 1000,
        currency: "USD",
      });
      await wallet.save();
      console.log("✅ Test wallet created");
    }

    // -----------------------------
    // 4️⃣ Create Dummy Transactions
    // -----------------------------
    const transactionsCount = await Transaction.countDocuments({ company: company._id });
    if (transactionsCount === 0) {
      const tx1 = new Transaction({
        from: null,
        to: superAdminId,
        amount: 500,
        type: "mint", // valid enum
        company: company._id,
      });
      const tx2 = new Transaction({
        from: superAdminId,
        to: null,
        amount: 200,
        type: "burn", // valid enum
        company: company._id,
      });
      await tx1.save();
      await tx2.save();
      console.log("✅ 2 Dummy transactions created");
    }

    // -----------------------------
    // 5️⃣ Fetch Dashboard
    // -----------------------------
    const fetchedCompany = await Company.findOne({ owner: superAdminId });
    const fetchedWallet = await Wallet.findOne({ userId: superAdminId }) || { balance: 0, currency: "USD" };
    const fetchedTransactions = await Transaction.find({ company: company._id })
      .sort({ createdAt: -1 })
      .limit(20) || [];

    console.log("✅ Dashboard fetched successfully:");
    console.log({
      company: fetchedCompany,
      wallet: fetchedWallet,
      transactions: fetchedTransactions,
    });

    // Disconnect
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  } catch (err) {
    console.error("❌ TestDashboard Error:", err);
    await mongoose.disconnect();
  }
}

main();