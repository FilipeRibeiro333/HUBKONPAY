/**
 * @file stakingService.js
 * @description Corporate Yield Generation & Asset Liquidation Engine.
 * Manages the lifecycle of staked capital, from lock-up to automated reward distribution.
 * 
 * @dev Frontier Hackathon Context:
 * "Capital Efficiency". This service bridges B2B treasury management with 
 * decentralized yield mechanics, ensuring all payouts are anchored to the Hubkon Blockchain.
 */

import Staking from "../models/stakingModel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import blockchain from "../utils/blockchain.js";

/**
 * @function createStaking
 * @description Initiates a new staking position by locking liquid assets into the reward pool.
 * @param {Object} params - { companyId, amount, rewardRate }
 */
export const createStaking = async ({ companyId, amount, rewardRate }) => {
  // 1️⃣ SOLVENCY CHECK: Ensuring the tenant has enough liquidity to stake
  const wallet = await Wallet.findOne({ companyId });
  if (!wallet || wallet.balance < amount) {
    throw new Error("STAKING_ERROR: Insufficient liquid balance to initiate lock-up.");
  }

  /** 
   * 2️⃣ CAPITAL LOCK-UP
   * Deducting from available balance. The funds are now "contract-bound".
   */
  wallet.balance -= amount;
  await wallet.save();

  // 3️⃣ POSITION INITIALIZATION
  const staking = await Staking.create({
    companyId,
    amount,
    rewardRate,
    active: true,
    startDate: new Date()
  });

  return staking;
};

/**
 * @function claimReward
 * @description Liquidates the staking position, returning the Principal + Yield to the corporate wallet.
 * @dev Implements pro-rata reward calculation based on time elapsed.
 */
export const claimReward = async (companyId) => {
  // 1️⃣ POSITION LOOKUP: Finding the active yield-bearing contract for the tenant
  const staking = await Staking.findOne({ companyId, active: true });
  if (!staking) throw new Error("LIQUIDATION_ERROR: No active staking position found.");

  const now = new Date();
  const diffTime = Math.abs(now - new Date(staking.startDate));
  const days = diffTime / (1000 * 60 * 60 * 24); // Time-weighted delta

  /** 
   * 🧮 YIELD CALCULATION
   * reward = principal * daily_rate * days_staked
   */
  const reward = Number((staking.amount * staking.rewardRate * days).toFixed(6));
  
  const wallet = await Wallet.findOne({ companyId });
  if (!wallet) throw new Error("INFRASTRUCTURE_ERROR: Corporate wallet not found.");

  /** 
   * 💰 CAPITAL RE-INJECTION
   * Returning Principal (e.g., 200) + Accrued Yield (e.g., 5) to the spendable balance.
   */
  const totalToReturn = staking.amount + reward;
  wallet.balance += totalToReturn;
  await wallet.save();

  // Closing the staking contract
  staking.active = false;
  await staking.save();

  /** 
   * 📜 AUDIT LOGGING (Internal Ledger)
   * Recording the payout with the specific 'staking_reward' transaction type.
   */
  const tx = await Transaction.create({
    from: null, // Originating from the Global Staking Pool
    to: companyId,
    company: companyId,
    amount: totalToReturn,
    bonusApplied: reward,
    type: "staking_reward", 
  });

  /** 
   * ⛓️ BLOCKCHAIN FINALITY
   * Anchoring the reward distribution to the Hubkon Sovereign Ledger for immutability.
   */
  blockchain.addTransaction({
    from: "staking_pool",
    to: companyId.toString(),
    amount: totalToReturn,
  });
  blockchain.minePendingTransactions();

  return { 
    success: true,
    accruedRewards: reward, 
    totalLiquidation: totalToReturn, 
    newLiquidBalance: wallet.balance,
    proofOfStake: tx 
  };
};
