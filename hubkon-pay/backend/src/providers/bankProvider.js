// src/providers/bankProvider.js
/**
 * Bank Provider
 * --------------------------
 * Simulates external payment provider.
 * Replace with real API in production.
 */

export async function processBankTransfer(transfer) {

  console.log("🌍 Sending to external provider...");

  // Simulated response
  const success = Math.random() > 0.2;

  return {
    success,
    id: 'EXT-' + Math.floor(Math.random() * 1000000),
  };
}