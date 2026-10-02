/**
 * @file stake.js
 * @description Yield Generation Engine for Corporate Assets.
 * Implements a simplified Proof-of-Stake (PoS) reward calculation for B2B liquidity.
 * 
 * @dev Frontier Hackathon Context:
 * This module demonstrates "Capital Efficiency". It allows businesses to earn 
 * a 5% yield on locked funds, managed by the Hubkon Smart Contract logic.
 */

class Stake {
  /**
   * @param {string} wallet - The public key or wallet address of the staker.
   * @param {number} amount - The total volume of assets being locked.
   * @param {number} startTime - Timestamp of the deposit.
   */
  constructor(wallet, amount, startTime = Date.now()) {
    this.wallet = wallet;
    this.amount = amount;
    this.startTime = startTime;
    this.rewardClaimed = false; // Prevents "Double-Spending" of rewards
  }

  /**
   * @notice Calculates real-time rewards based on time elapsed.
   * @param {number} currentTime - Current timestamp for accurate calculation.
   * @returns {number} The calculated reward based on a 5% periodic rate.
   */
  calculateReward(currentTime = Date.now()) {
    if (this.rewardClaimed) return 0;

    const duration = (currentTime - this.startTime) / 1000; // Duration in seconds
    const annualRate = 0.05; // 5% Base Yield (as defined in Global Settings)
    
    /**
     * SIMPLIFIED YIELD FORMULA:
     * reward = principal * rate * (time_elapsed / period_constant)
     * @dev For the demo, we use a 60-second period for fast visualization.
     */
    return this.amount * annualRate * (duration / 60); 
  }

  /**
   * @notice Flags the stake as processed after a successful payout.
   */
  claim() {
    this.rewardClaimed = true;
  }
}

module.exports = Stake;
