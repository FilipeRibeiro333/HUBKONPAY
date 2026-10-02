import mongoose from "mongoose";
import Escrow from "../models/EscrowModel.js"; // Standardized name
import Wallet from "../models/WalletModel.js";
import Transaction from "../models/TransactionModel.js";

/**
 * 💳 Create Checkout Session
 * Handles fund locking and Escrow initialization
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { companyA, companyB, amount, currency = "USD" } = req.body;
    
    // Ensure userId is handled correctly from auth middleware
    const userId = req.user?._id || req.body.userId; 

    if (!companyA || !companyB || !amount) {
      return res.status(400).json({
        success: false,
        message: "companyA, companyB, and amount are required fields"
      });
    }

    // 🔹 Financial Calculation: 2% Platform Fee
    const fee = Math.round(amount * 0.02 * 100) / 100;
    const netAmount = amount - fee;

    // 🔹 Create Escrow (FIXED: Added 'new' to ObjectId)
    const escrow = await Escrow.create({
      companyA,
      companyB,
      amount,
      currency,
      fee,
      netAmount,
      status: "pending",
      // Fix: Mongoose Classes require 'new' keyword
      createdBy: userId ? new mongoose.Types.ObjectId(userId) : null, 
      history: [
        { 
          action: "checkout_created", 
          user: userId || null, 
          details: `Checkout initiated for ${amount} ${currency}` 
        }
      ]
    });

    // 🔹 Fund Locking Logic (Atomic Operation)
    const walletA = await Wallet.findOne({ companyId: companyA });
    
    if (!walletA) throw new Error("Buyer wallet not found");
    if (walletA.balance < amount) throw new Error("Insufficient funds for this transaction");

    // Move funds from 'balance' to 'locked' (The Escrow Vault)
    walletA.balance -= amount;
    walletA.locked += amount; 
    await walletA.save();

    // 🔹 Ledger Registration
    await Transaction.create({
      from: companyA,
      to: companyB,
      company: companyA, // Keeping track of the entity
      amount,
      currency,
      feeApplied: fee,
      netAmount,
      relatedEscrow: escrow._id,
      type: "escrow_created"
    });

    // 🚀 Success Response
    return res.json({
      success: true,
      message: "Checkout session created successfully",
      escrowId: escrow._id,
      amount,
      currency,
      fee,
      netAmount
    });

  } catch (error) {
    console.error("❌ [CHECKOUT ERROR]:", error.message);
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};
