/**
 * @file riskService.js
 * @description B2B Risk Underwriting & Credit Scoring Engine.
 * Evaluates corporate eligibility for Receivable Factoring (Turbo Advance).
 * 
 * @dev Frontier Hackathon Context:
 * "Smart Credit". This engine implements algorithmic risk assessment to 
 * dictate dynamic fees and advance limits before on-chain execution.
 */

import Company from "../models/CompanyModel.js";

/**
 * @function evaluateAdvanceRisk
 * @description Analyzes a company's financial standing and dispute history to authorize capital advances.
 * @param {string} companyId - Target corporate entity.
 * @param {number} amount - Requested advance volume.
 * @returns {Promise<Object>} Risk assessment report with approval status and dynamic fees.
 */
export const evaluateAdvanceRisk = async (companyId, amount) => {
  // 1️⃣ DATA ACQUISITION: Fetching the tenant's corporate profile
  const company = await Company.findById(companyId);
  
  if (!company) {
    throw new Error("RISK_ASSESSMENT_FAILED: Corporate entity not found.");
  }

  /** 
   * 2️⃣ SCORE-BASED VOLUME CAPPING
   * Rule: New or low-score entities (Score < 60) are restricted from high-volume exposure.
   */
  if (company.creditScore < 60 && amount > 500) {
    return { 
      allowed: false, 
      reason: "INSUFFICIENT_CREDIT_SCORE: Required minimum score (60) for this volume not met." 
    };
  }

  /** 
   * 3️⃣ OPERATIONAL RISK CHECK
   * Penalty: Companies with active or historical escrow disputes are blocked from advances.
   */
  if (company.disputedEscrows > 0) {
    return { 
      allowed: false, 
      reason: "OPERATIONAL_RISK_BLOCK: Pending or historical disputes detected." 
    };
  }

  /** 
   * 4️⃣ DYNAMIC FEE CALCULATION
   * Reward Tiering:
   * - Elite Partners (Score > 90): 3% Fee.
   * - Standard Partners: 5% Fee.
   */
  let dynamicFee = 0.05; // 5% Standard base fee
  if (company.creditScore > 90) {
    dynamicFee = 0.03; // 3% Discounted fee for high-trust entities
  }

  /** 
   * 5️⃣ EXPOSURE LIMIT CALCULATION
   * Risk-weighted limit: amount is proportional to the credit score.
   * Example: Score 70 = $7,000 Advance Cap.
   */
  const exposureLimit = company.creditScore * 100;

  return { 
    allowed: true, 
    fee: dynamicFee,
    maxAmount: exposureLimit,
    riskRating: company.creditScore >= 80 ? "LOW_RISK" : "MEDIUM_RISK"
  };
};
