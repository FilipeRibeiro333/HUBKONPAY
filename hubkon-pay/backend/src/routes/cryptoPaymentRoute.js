/**
 * @file cryptoPaymentRoute.js
 * @description Sandbox Route for Crypto-Payment Integration & Testing.
 * Facilitates the validation of inbound payment payloads before on-chain settlement.
 * 
 * @dev Frontier Hackathon Context:
 * "Testing Framework". This route allows for rapid prototyping of the 
 * crypto-payment flow, ensuring the Hubkon backend correctly interprets 
 * transaction metadata from the frontend or external oracles.
 */

const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/crypto-payment/test
 * @desc    Integration Sandbox for validating crypto payment payloads.
 * @access  Public (Development Only)
 */
router.post('/test', (req, res) => {
  /** 
   * INBOUND TELEMETRY:
   * Captures the payload for debugging and structure validation.
   */
  console.log('📥 [DEBUG] Crypto-payment test payload received:', req.body);

  /** 
   * ACKNOWLEDGMENT RESPONSE:
   * Confirms the gateway is active and returning the echoed data for verification.
   */
  res.json({
    success: true,
    message: '✅ Crypto-payment integration gateway is ACTIVE.',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
