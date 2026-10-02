/**
 * Staking Controller
 * ------------------------------------------------
 * Handles HTTP requests related to staking rewards.
 *
 * Responsibilities:
 * 1. Validate authenticated user
 * 2. Call staking service to claim rewards
 * 3. Format API response
 * 4. Handle and return clear error messages
 */

import { claimReward } from "../services/stakingService.js";

export const claimRewardsController = async (req, res) => {
  try {

    // ------------------------------------------------
    // 1️⃣ Extract authenticated user ID from JWT middleware
    // ------------------------------------------------
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing"
      });
    }

    // ------------------------------------------------
    // 2️⃣ Call staking service to calculate and claim rewards
    // ------------------------------------------------
    const result = await claimReward(userId);

    // ------------------------------------------------
    // 3️⃣ Return formatted success response
    // ------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Rewards claimed successfully",
      rewards: result?.rewards || 0,
      transactionId: result?.transaction?._id || null
    });

  } catch (error) {

    // ------------------------------------------------
    // 4️⃣ Log full error for backend debugging
    // ------------------------------------------------
    console.error("❌ Staking claim error:", error);

    // ------------------------------------------------
    // 5️⃣ Send clean error response to frontend
    // ------------------------------------------------
    return res.status(400).json({
      success: false,
      message: error?.message || "Unknown error"
    });

  }
};