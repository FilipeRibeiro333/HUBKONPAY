/**
 * HUBKON PAY - EMERGENCY KILL SWITCH SCRIPT
 * Run this to immediately freeze all outgoing transactions.
 * Usage: node scripts/emergency-halt.js
 */

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function triggerKillSwitch() {
  console.log("🚨 TRIGGERING HUBKON KILL SWITCH...");
  
  // Set global freeze flag
  await redis.set('HUBKON_KILL_SWITCH', 'true');
  
  // Set an expiration if needed, or leave it until manual resume
  console.log("✅ SYSTEM FROZEN. All outgoing payments are now blocked.");
  process.exit(0);
}

triggerKillSwitch();
