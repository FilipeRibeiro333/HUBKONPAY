/**
 * @file auditMiddleware.js
 * @description System-wide Audit Logging & Compliance Engine.
 * Captures user activities for forensic analysis and B2B transparency.
 * 
 * @dev Frontier Hackathon Context:
 * "Trust but Verify". This module provides the off-chain evidence required 
 * for corporate auditing, complementing the Hubkon Sovereign Ledger.
 */

/**
 * @function logAction
 * @description Asynchronously records administrative and financial actions.
 * @param {string} userId - Identity of the actor (Defaults to "Guest" for unauthenticated events).
 * @param {string} action - Human-readable description of the event (e.g., "SBT_ISSUANCE").
 * @param {Object} data - Contextual metadata associated with the action.
 * @async
 */
const logAction = async (userId, action, data) => {
  /**
   * 🛡️ FORENSIC LOGGING:
   * Structured output for external log aggregators (e.g., ELK Stack, Datadog).
   */
  const timestamp = new Date().toISOString();
  
  console.log(
    `[AUDIT_TRAIL] [${timestamp}] | Actor: ${userId || "SYSTEM_GUEST"} | Action: ${action.toUpperCase()} | Context:`, 
    JSON.stringify(data)
  );

  /**
   * @todo Persistence:
   * Integration point to store these logs in a dedicated 'Audit' collection 
   * in MongoDB for long-term B2B compliance reporting.
   */
};

export default logAction;
