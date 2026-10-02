/**
 * @file settingsService.js
 * @description Global Governance & Economic Parameterization Service.
 * Manages the platform's core financial rules, such as Escrow fees and Staking yields.
 * 
 * @dev Frontier Hackathon Context:
 * "Protocol Governance". This service allows administrators to fine-tune the 
 * Hubkon ecosystem's economic incentives without re-deploying infrastructure.
 */

import GlobalSettings from "../models/GlobalSettings.js";

/**
 * @function getSetting
 * @description Retrieves a specific governance parameter from the persistence layer.
 * @param {string} key - Unique identifier for the setting (e.g., "escrow_fee_percent").
 * @param {*} defaultValue - Fallback value if the setting is not found.
 * @returns {Promise<any>} The current value of the parameter.
 */
export const getSetting = async (key, defaultValue) => {
  /** 
   * DATA ACQUISITION:
   * Querying the GlobalSettings collection for the target configuration key.
   */
  const setting = await GlobalSettings.findOne({ key });
  return setting ? setting.value : defaultValue;
};

/**
 * @function setSetting
 * @description Updates or initializes a global economic parameter with strict key validation.
 * @param {string} key - The target configuration key.
 * @param {any} value - The new value to be applied across the ecosystem.
 * @throws {Error} If the key is not part of the authorized governance whitelist.
 */
export const setSetting = async (key, value) => {
  /** 
   * SECURITY WHITELIST:
   * Only approved economic levers can be manipulated via this service.
   * - escrow_fee_percent: Platform cut from B2B contracts (Standard 2%).
   * - penalty_percent: Cost for contract breaches or late settlements.
   * - staking_bonus_percent: Annual yield provided to corporate stakers.
   */
  const allowedKeys = [
    "escrow_fee_percent",
    "penalty_percent",
    "staking_bonus_percent"
  ];

  if (!allowedKeys.includes(key)) {
    throw new Error(`GOVERNANCE_ERROR: Unauthorized configuration key: [${key}]`);
  }

  /** 
   * ATOMIC UPDATE (UPSERT):
   * Updates the existing value or creates a new entry if it doesn't exist.
   */
  const setting = await GlobalSettings.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true }
  );

  return setting;
};
