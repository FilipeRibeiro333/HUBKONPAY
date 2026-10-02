/**
 * @file webhookService.js
 * @description Secure Event Notification & B2B Integration Service.
 * Dispatches cryptographically signed webhooks to external corporate endpoints.
 * 
 * @dev Frontier Hackathon Context:
 * "Real-time Interoperability". This service ensures that when a transaction is 
 * finalized on the Hubkon Sovereign Ledger, the client's internal system 
 * (ERP/Accounting) is immediately notified with a verified proof.
 */

import axios from "axios";
import crypto from "crypto";

/**
 * @function sendWebhook
 * @description Dispatches a secure POST request to the tenant's configured endpoint.
 * @param {Object} company - The Company document (must contain webhookUrl and webhookSecret).
 * @param {string} event - The standardized event identifier (e.g., "escrow.released").
 * @param {Object} data - The event payload (transaction details, amounts, IDs).
 */
export const sendWebhook = async (company, event, data) => {
  // 1️⃣ CONFIGURATION CHECK: Only dispatch if the tenant has established a listener.
  if (!company.webhookUrl) return; 

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  /** 
   * 2️⃣ CRYPTOGRAPHIC SIGNATURE (HMAC SHA-256)
   * Prevents webhook spoofing. The client uses their unique 'webhookSecret' 
   * to verify that the message originated from Hubkon.
   */
  const signature = crypto
    .createHmac("sha256", company.webhookSecret || "HUBKON_DEFAULT_SECRET")
    .update(JSON.stringify(payload))
    .digest("hex");

  try {
    /** 
     * 3️⃣ ASYNCHRONOUS DISPATCH
     * Using Axios with a short timeout to prevent blocking the main thread.
     */
    await axios.post(company.webhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Hubkon-Signature": signature, // Custom header for client-side validation
        "User-Agent": "Hubkon-Webhook-Engine/1.0"
      },
      timeout: 5000, 
    });

    console.log(`✅ [WEBHOOK_SUCCESS] Event [${event}] dispatched to ${company.name}`);
  } catch (err) {
    /** 
     * 4️⃣ FAILURE LOGGING
     * Capturing delivery errors without interrupting the transaction lifecycle.
     */
    console.error(`❌ [WEBHOOK_FAILURE] Target: ${company.name} | Error: ${err.message}`);
    // @todo: Implement a retry queue (BullMQ/Redis) for failed deliveries.
  }
};
