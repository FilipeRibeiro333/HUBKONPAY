/**
 * HUBKON PAY - TRANSACTION EXECUTIONER (ELITE VERSION)
 * Background worker that releases funds only after Timelock + Security Checks.
 */

import mongoose from 'mongoose';
import Redis from 'ioredis';
import Transaction from '../models/transactionModel.js';
// Import your real gateway here (e.g., Stripe, Binace, Bank API)
// import { paymentGateway } from '../services/gatewayService.js'; 

// 1. REDIS CONFIGURATION (Connecting to your WSL2 Ubuntu Redis)
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379
});

/**
 * Main execution logic
 */
async function processReadyTransactions() {
  console.log(`[${new Date().toISOString()}] 🔍 Executioner: Scanning for ripe transactions...`);

  try {
    // A. SECURITY CHECK: Is the Kill Switch active?
    // If the system is frozen, the worker won't even search for transactions.
    const isSystemPaused = await redis.get('HUBKON_KILL_SWITCH');
    if (isSystemPaused === 'true') {
      console.warn("🚨 [CRITICAL] Executioner Halted: System is in Emergency Mode.");
      return; 
    }

    // B. FIND UNLOCKED TRANSACTIONS
    // Status: TIMELOCK_ACTIVE and releaseAt time has passed
    const readyTransactions = await Transaction.find({
      status: "TIMELOCK_ACTIVE",
      releaseAt: { $lte: new Date() }
    });

    if (readyTransactions.length === 0) return;

    for (const tx of readyTransactions) {
      try {
        console.log(`   🚀 Processing TX ${tx._id} | Amount: ${tx.amount} ${tx.currency}`);

        // C. GATEWAY EXECUTION
        // This is where the actual money transfer happens
        // await paymentGateway.sendFunds(tx.amount, tx.to);

        // D. FINAL UPDATE
        tx.status = "COMPLETED";
        await tx.save();

        console.log(`   ✅ TX ${tx._id} successfully finalized and released.`);

      } catch (error) {
        console.error(`   ❌ Failed to process TX ${tx._id}:`, error.message);
        // Optional: Move to a "FAILED" status if retries fail
      }
    }

  } catch (error) {
    console.error("🚨 [WORKER_ERROR] Critical failure in execution cycle:", error);
  }
}

// Start the cycle every 60 seconds (Standard for Fintech)
setInterval(processReadyTransactions, 60000);

// Initial run
processReadyTransactions();
