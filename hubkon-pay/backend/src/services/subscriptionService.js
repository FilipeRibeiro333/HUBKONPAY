/**
 * @file subscriptionService.js
 * @description B2B Subscription Management & Enterprise Tier Provisioning.
 * Orchestrates plan renewals, feature unlocking, and multi-tenant status updates.
 * 
 * @dev Frontier Hackathon Context:
 * "Token-Gated Business Logic". This service manages the "Off-Chain" subscription state 
 * that dictates which Web3 features (e.g., Enterprise Blockchain Sealing) the tenant can access.
 */

import Company from "../models/CompanyModel.js";
import { logger } from "../config/logger.js";
import { sendWebhook } from "./webhookService.js";

/**
 * @function renewSubscription
 * @description Activates or upgrades a corporate plan after payment confirmation.
 * @param {string} companyId - Target enterprise tenant.
 * @param {string} newPlan - Target tier (basic, pro, enterprise).
 * @returns {Promise<Object>} The updated corporate profile with new validity.
 */
export const renewSubscription = async (companyId, newPlan = "pro") => {
  try {
    // 1️⃣ TENANT IDENTIFICATION: Fetching the corporate DNA
    const company = await Company.findById(companyId);
    if (!company) throw new Error("PROVISIONING_ERROR: Corporate entity not found.");

    /** 
     * 2️⃣ VALIDITY EXTENSION
     * Setting the next expiration date (+30 days from current execution).
     */
    const nextExpiry = new Date();
    nextExpiry.setDate(nextExpiry.getDate() + 30);

    /** 
     * 3️⃣ STATE TRANSITION
     * Updating plan tier and re-activating high-privilege access.
     */
    company.plan = newPlan;
    company.subscriptionStatus = "active";
    company.subscriptionExpiresAt = nextExpiry;

    await company.save();

    console.log(`🚀 [RENEWAL_SUCCESS] ${company.name} upgraded to ${newPlan.toUpperCase()} tier.`);

    /** 
     * 4️⃣ AUDIT & OBSERVABILITY (Security Log)
     * Recording the financial event for internal forensic auditing.
     */
    logger.info(`📈 [SUBSCRIPTION_UPGRADE] Plan renewed successfully.`, {
      tenant: company.name,
      assignedTier: newPlan,
      expirationDate: nextExpiry
    });

    /** 
     * 5️⃣ EXTERNAL NOTIFICATION (Webhook)
     * Alerting the client's infrastructure that Web3 capabilities are now UNLOCKED.
     */
    if (company.webhookUrl) {
      await sendWebhook(company, "subscription.activated", {
        plan: newPlan,
        expiresAt: nextExpiry,
        // Business Logic: Enterprise Tier unlocks the Sovereign Blockchain features
        unlockedCapabilities: newPlan === "enterprise" ? "BLOCKCHAIN_SEALING_UNLOCKED" : "BASIC_YIELD_UNLOCKED"
      });
    }

    return { success: true, updatedCompany: company };
  } catch (err) {
    logger.error("❌ [SUBSCRIPTION_CRITICAL_ERROR]:", err.message);
    throw new Error("RENEWAL_PROTOCOL_FAILED: " + err.message);
  }
};
