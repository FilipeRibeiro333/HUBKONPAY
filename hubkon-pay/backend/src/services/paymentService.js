/**
 * HUBKON PAY - DYNAMIC FINANCIAL INTELLIGENCE SERVICE
 * Strategy: "Speed at the surface, security at the core."
 * Version: V.1022 ELITE ✅
 */

import Transaction from "../models/transactionModel.js";
import GlobalSettings from "../models/GlobalSettings.js";
import { notifySecurityTeam } from "./notificationService.js";
import Redis from 'ioredis';

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379
});

const getDynamicLimits = async () => {
  try {
    const settings = await GlobalSettings.findOne({ key: 'escrow_rules' });
    const rules = settings?.value || {};
    return {
      INSTANT_USD: parseFloat(rules.instantLimit) || 1000,
      CRITICAL_USD: parseFloat(rules.criticalLimit) || 10000,
      HOURLY_MAX_USD: parseFloat(rules.hourlyMax) || 3000,
      TIMELOCK_HOURS: parseInt(rules.timelockHours) || 24
    };
  } catch (error) {
    return { INSTANT_USD: 1000, CRITICAL_USD: 10000, HOURLY_MAX_USD: 3000, TIMELOCK_HOURS: 24 };
  }
};

export const initiateTransfer = async (amount, destinationAccount, userId, type = "transfer") => {
  const LIMITS = await getDynamicLimits();
  console.log(`[FINANCE] Request: ${amount} USD | User: ${userId} | Dynamic Limits Active`);

  try {
    const hourlyKey = `user_volume_1h:${userId}`;
    const currentVolume = parseFloat(await redis.get(hourlyKey)) || 0;
    const projectedTotal = currentVolume + amount;

    if (projectedTotal > LIMITS.HOURLY_MAX_USD) {
      console.warn(`🚨 [RISK_ALERT] User ${userId} exceeded dynamic hourly limit (${LIMITS.HOURLY_MAX_USD}).`);
      return await queueForTimelock(amount, destinationAccount, userId, type, LIMITS.TIMELOCK_HOURS, true);
    }

    if (amount <= LIMITS.INSTANT_USD) {
      await redis.set(hourlyKey, projectedTotal, 'EX', 3600);
      return await executeInstantPayment(amount, destinationAccount, userId, type);
    }

    if (amount > LIMITS.INSTANT_USD && amount < LIMITS.CRITICAL_USD) {
      return await queueForTimelock(amount, destinationAccount, userId, type, LIMITS.TIMELOCK_HOURS);
    }

    if (amount >= LIMITS.CRITICAL_USD) {
      return await triggerMultisigProtocol(amount, destinationAccount, userId, type);
    }

  } catch (error) {
    console.error("[CRITICAL_FINANCE_ERROR]", error);
    throw new Error("Financial Operation Rejected by HUBKON Core");
  }
};

async function executeInstantPayment(amount, to, userId, type) {
  const tx = await Transaction.create({
    from: userId, to, amount, type,
    status: "COMPLETED",
    netAmount: amount
  });
  console.log(`⚡ [HOT_WALLET] TX ${tx._id} executed instantly.`);
  return tx;
}

async function queueForTimelock(amount, to, userId, type, hours, riskTrigger = false) {
  const releaseDate = new Date();
  releaseDate.setHours(releaseDate.getHours() + hours);

  const tx = await Transaction.create({
    from: userId, to, amount, type,
    status: "TIMELOCK_ACTIVE",
    releaseAt: releaseDate
  });

  await notifySecurityTeam(tx, riskTrigger ? "Velocity Limit Exceeded" : "Standard Hold");
  console.log(`⏱️ [TIMELOCK] TX ${tx._id} locked for ${hours}h.`);
  return tx;
}

async function triggerMultisigProtocol(amount, to, userId, type) {
  const tx = await Transaction.create({
    from: userId, to, amount, type,
    status: "PENDING_APPROVAL", 
  });

  await notifySecurityTeam(tx, "High-Value Transaction");
  return tx;
}
