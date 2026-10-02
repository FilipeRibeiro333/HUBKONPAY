/**
 * @file rewardsController.js
 * @description Yield Redemption & Rewards Orchestration Controller.
 * Manages the distribution of staking interests and network incentives to B2B users.
 * 
 * @dev Frontier Hackathon Context:
 * This module demonstrates the "Yield-Bearing" nature of the Hubkon ecosystem. 
 * It ensures that corporate partners can claim their accrued rewards 
 * according to the Sovereign Ledger's staking rules.
 */

import User from "../models/userModel.js"; // Standardizing import

/**
 * @function claimRewards
 * @description Processes the withdrawal of accrued staking rewards.
 * @route POST /api/rewards/claim
 * @access Private (Authenticated User)
 */
export async function claimRewards(req, res) {
  const userId = req.user?.id || req.user?.userId;
  console.log("🟢 EXECUTION_START: Redirection process initiated for user:", userId);

  try {
    // 1️⃣ IDENTITY VERIFICATION: Ensure the session belongs to a valid tenant
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ ERROR: User identity not found in Hubkon directory.");
      return res.json({ success: false, message: "USER_NOT_FOUND" });
    }
    console.log("👤 CONTEXT_VERIFIED: Identity match for", user.email);

    /** 
     * 2️⃣ SOLVENCY CHECK
     * Verification of internal ledger balance before processing payouts.
     */
    console.log("💰 CURRENT_LIQUIDITY:", user.wallet.balance);
    if (user.wallet.balance <= 0) {
      console.warn("⚠️ WARNING: Insufficient funds for payout.");
      return res.json({ success: false, message: "INSUFFICIENT_LIQUIDITY_FOR_CLAIM" });
    }

    /**
     * 3️⃣ REDEMPTION LOGIC (Hybrid Execution)
     * Calculates the accrued yield based on the Staking Engine's logic.
     */
    try {
      // Integration with the calculateReward logic from stake.js
      const rewardAmount = calculateReward(user); 
      console.log("🎯 ACCRUED_YIELD_TARGET:", rewardAmount);

      if (!rewardAmount || rewardAmount <= 0) {
        console.warn("⚠️ WARNING: No claimable yield detected for this cycle.");
        return res.json({ success: false, message: "NO_REWARDS_AVAILABLE" });
      }

      /**
       * 4️⃣ SETTLEMENT & PERSISTENCE
       * Updating the internal ledger. 
       * @dev In a production environment, this triggers an on-chain transaction.
       */
      user.wallet.balance -= rewardAmount;
      await user.save();
      
      console.log("✅ SUCCESS: Payout executed. New Internal Balance:", user.wallet.balance);

      return res.json({ 
        success: true, 
        message: "REWARD_CLAIM_PROCESSED_SUCCESSFULLY", 
        amount: rewardAmount 
      });

    } catch (innerErr) {
      console.error("🔥 INTERNAL_PROCESSING_ERROR:", innerErr.message);
      return res.json({ 
        success: false, 
        message: "PAYOUT_ENGINE_FAILURE", 
        error: innerErr.message 
      });
    }

  } catch (err) {
    console.error("❌ CRITICAL_CONTROLLER_ERROR:", err.message);
    return res.json({ 
      success: false, 
      message: "UNKNOWN_EXCEPTION_IN_REWARDS_CONTROLLER", 
      error: err.message 
    });
  }
}
