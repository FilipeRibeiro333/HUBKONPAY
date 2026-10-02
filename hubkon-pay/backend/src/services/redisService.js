// stakingService.js
// ---------------------------------------------
// Staking Service
// - Calculates pending rewards
// - Credits user wallet
// - Logs transaction
// - Adds transaction to blockchain
// - Ensures no NaN values are saved
// ---------------------------------------------

import Staking from "../models/stakingModel.js";
import Wallet from "../models/walletModel.js";
import Transaction from "../models/transactionModel.js";
import blockchain from "../blockchain/blockchainSingleton.js";

export const claimReward = async (userId) => {
  // 1️⃣ Get active staking
  const staking = await Staking.findOne({ userId, active: true });
  if (!staking) throw new Error("No active staking found");

  // 2️⃣ Calculate pending rewards safely
  const now = new Date();
  const stakingStart = new Date(staking.startDate);
  const diffTime = now - stakingStart;
  const daysStaked = diffTime / (1000 * 60 * 60 * 24);

  const rewardRate = Number(staking.rewardRate || 0);  // ensure number
  const amount = Number(staking.amount || 0);           // ensure number

  const pendingRewards = amount * rewardRate * daysStaked;

  if (pendingRewards <= 0 || isNaN(pendingRewards)) throw new Error("No rewards available");

  // 3️⃣ Credit rewards to wallet safely
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new Error("Wallet not found");

  wallet.balance = Number(wallet.balance || 0); // ensure numeric
  wallet.balance += pendingRewards;

  await wallet.save();

  // 4️⃣ Create transaction log
  const tx = await Transaction.create({
    from: null,
    to: userId,
    amount: pendingRewards,
    type: "staking_reward",
  });

  // 5️⃣ Add to blockchain
  blockchain.addTransaction({
    from: "staking_pool",
    to: userId,
    amount: pendingRewards,
    type: "reward",
  });

  return { rewards: pendingRewards, transaction: tx };
};