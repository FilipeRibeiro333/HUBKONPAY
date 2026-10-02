// src/controllers/claimRewardsController.js
// ---------------------------------------------
// Controller to handle HTTP requests for claiming staking rewards
// ---------------------------------------------

import { claimReward } from "../services/stakingService.js";

export const claimRewardsController = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware

    // Call service to calculate and credit rewards
    const result = await claimReward(userId);

    res.json({
      success: true,
      message: "Rewards claimed successfully",
      rewards: result.rewards,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};