/**
 * @file localPaymentService.js
 * @description Local Payment Gateway Simulation for Regional Markets (Angola/AOA).
 * Bridges traditional fiat transactions with the Hubkon Web3 Settlement Engine.
 * 
 * @dev Frontier Hackathon Context:
 * Hyper-localization. This module demonstrates Hubkon's ability to facilitate 
 * B2B payments in emerging markets, converting local fiat (AOA) 
 * into blockchain-verified liquidity.
 */

/**
 * @function createPayment
 * @description Simulates a local fiat payment processing (Sandbox/Test Mode).
 * @param {number} amount - Transaction value.
 * @param {string} currency - ISO Code (Default: 'AOA' for Angolan Kwanza).
 * @returns {Promise<Object>} Mocked payment response for testing settlement logic.
 */
async function createPayment(amount, currency = 'aoa') {
  /**
   * TRANSACTION LOGGING:
   * Tracking the entry point of fiat-to-crypto bridging.
   */
  console.log(`[LOCAL_GATEWAY] Simulating regional payment: ${amount} ${currency.toUpperCase()}`);

  /**
   * MOCKED SETTLEMENT RESPONSE:
   * Returns a successful status to trigger the On-chain Escrow/SBT logic.
   * @property {string} id - Unique local transaction identifier.
   * @property {string} status - Fixed as 'succeeded' for development/demo purposes.
   */
  return {
    id: 'LOCAL_AOA_' + Date.now(),
    amount,
    currency: currency.toLowerCase(),
    status: 'succeeded',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  createPayment
};
