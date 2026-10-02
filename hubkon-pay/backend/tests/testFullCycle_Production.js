/**
 * HUBKON PAY - PRODUCTION CYCLE AUDIT
 * Simulates: Company Setup -> Staking -> Escrow -> Dual Approval -> Fee Collection
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Wallet from "../src/models/WalletModel.js";
import Company from "../src/models/CompanyModel.js";
import { createEscrow, approveEscrow, releaseEscrow } from "../src/services/escrowService.js";
import { createStaking, claimReward } from "../src/services/stakingService.js";

const runAudit = async () => {
  try {
    console.log("🚀 [AUDIT] Connecting to High-Availability Cluster...");
    await mongoose.connect(process.env.MONGO_URI);

    // Initial Database Reset
    await Company.deleteMany({});
    await Wallet.deleteMany({});

    // Entity Creation
    const buyer = await Company.create({ name: "Buyer Global Corp", email: "buyer@hubkon.com" });
    const seller = await Company.create({ name: "Tech Supplier Ltd", email: "seller@hubkon.com" });

    // Wallet Initialization
    await Wallet.create({ isPlatform: true, balance: 0 }); // Platform Profit Wallet
    const wA = await Wallet.create({ companyId: buyer._id, balance: 1000 });
    const wB = await Wallet.create({ companyId: seller._id, balance: 500 });

    console.log(`💰 [SALDO INICIAL] A: ${wA.balance} | B: ${wB.balance}`);

    // Phase 1: Staking Flow
    console.log("\n--- PHASE 1: STAKING DEPLOYMENT ---");
    await createStaking({ companyId: buyer._id, amount: 200, rewardRate: 0.05 });
    console.log("📉 Buyer locked $200 in yield-bearing staking.");

    // Phase 2: Escrow Flow
    console.log("\n--- PHASE 2: SECURE ESCROW CONTRACT ---");
    const escrow = await createEscrow({ companyA: buyer._id, companyB: seller._id, amount: 100 });

    // Step: Approval process
    await approveEscrow(escrow._id, { companyId: buyer._id, role: "buyer" });
    await approveEscrow(escrow._id, { companyId: seller._id, role: "seller" });
    console.log("✅ Dual-approval verified.");

    // Step: Release & Settlement
    const result = await releaseEscrow(escrow._id, { companyId: buyer._id });
    console.log(`🚀 [RELEASE OK] Fee: ${result.fee} | Net to Seller: ${result.netAmount} ${result.currency}`);

    // Phase 3: Reward Claim
    console.log("\n--- PHASE 3: REWARD RECOVERY ---");
    const claimRes = await claimReward(buyer._id);
    console.log(`📈 Rewards recovered: ${claimRes.rewards}`);

    // Final Treasury Report
    const finalA = await Wallet.findOne({ companyId: buyer._id });
    const finalB = await Wallet.findOne({ companyId: seller._id });
    const treasury = await Wallet.findOne({ isPlatform: true });

    console.log("\n============================================");
    console.log("📊     HUBKON FINANCIAL PERFORMANCE REPORT  ");
    console.log("============================================");
    console.log(`✅ WALLET A (Buyer):  ${finalA.balance.toFixed(6)}`);
    console.log(`✅ WALLET B (Seller): ${finalB.balance.toFixed(2)}`);
    console.log(`🏦 PLATFORM PROFIT:  ${treasury.balance.toFixed(2)} (Ford Raptor Fund 🏎️)`);
    console.log("============================================\n");

    await mongoose.disconnect();
    console.log("🔌 [AUDIT] Audit cycle finished successfully.");
  } catch (err) {
    console.error("❌ [AUDIT FAILED]:", err.message);
    process.exit(1);
  }
};

runAudit();
