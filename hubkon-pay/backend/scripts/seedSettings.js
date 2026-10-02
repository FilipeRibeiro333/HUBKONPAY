/**
 * @file seedGlobalSettings.js
 * @description Economic Policy Provisioning for the HUBKON B2B Ecosystem.
 * Defines the core rules for fees, risk management, and liquidity.
 * 
 * @dev Frontier Hackathon Context:
 * These parameters act as the "On-Chain/Off-Chain Oracle" that dictates 
 * how the HubkonID (SBT) and Escrow Smart Contracts behave financially.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import GlobalSettings from "../src/models/GlobalSettings.js";

dotenv.config();

/**
 * Initializes the Economic "Golden Rules" of the system.
 */
const seed = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not found");
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Connected for Economic Policy Seeding...");

    // 🧹 Purging old configurations to ensure idempotency
    await GlobalSettings.deleteMany({ key: "escrow_rules" });

    /**
     * CORE ECONOMIC PARAMETERS (B2B Enterprise Level)
     * @property {number} fee - Base Escrow Fee (2%)
     * @property {number} advanceFee - Anticipation Fee (Total 5% for early payouts)
     * @property {number} riskMultiplier - 10X Liquidity Reserve Rule (Solvency Protection)
     * @property {number} minScore - Minimum KYC/Risk Score for VIP features
     * @property {number} stakingYield - Base Annual Yield (5%) for locked B2B funds
     */
    const initialRules = {
      key: "escrow_rules",
      description: "Escrow Fees, Risk Assessment, and Anticipation Rules for HUBKON-Pay",
      value: {
        fee: 0.02,             
        advanceFee: 0.03,      
        riskMultiplier: 10,    
        minScore: 60,          
        stakingYield: 0.05     
      }
    };

    await GlobalSettings.create(initialRules);

    console.log("\n============================================");
    console.log("🚀      HUBKON ECONOMIC POLICY DEPLOYED     ");
    console.log("============================================");
    console.log(`✅ Base Escrow Fee:   ${initialRules.value.fee * 100}%`);
    console.log(`✅ Advance Payout:    +${initialRules.value.advanceFee * 100}%`);
    console.log(`✅ Liquidity Guard:   ${initialRules.value.riskMultiplier}X (Risk Management)`);
    console.log(`✅ Minimum VIP Score: ${initialRules.value.minScore}`);
    console.log("============================================\n");

    await mongoose.disconnect();
    console.log("🔌 Economic settings successfully planted.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Critical Economic Seeding Failure:", err.message);
    process.exit(1);
  }
};

seed();
