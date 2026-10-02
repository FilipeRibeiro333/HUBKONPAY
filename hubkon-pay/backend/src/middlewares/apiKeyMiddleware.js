/**
 * @file apiKeyMiddleware.js
 * @description API Key Authentication Guard for B2B Integrations (Machine-to-Machine).
 * Validates the 'x-api-key' header to authorize external requests from Enterprise Tenants.
 * 
 * @dev Frontier Hackathon Context:
 * Enables the "API-First" strategy of Hubkon. This middleware allows 
 * third-party corporate systems to interact with the Hubkon Sovereign Ledger 
 * via secure, persistent access keys.
 */

import mongoose from 'mongoose';
import ApiKey from '../models/apiKeyModel.js';

/**
 * @middleware apiKeyMiddleware
 * @description Intercepts and validates API Keys provided in the request headers.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const apiKeyMiddleware = async (req, res, next) => {
  try {
    const key = req.headers['x-api-key'];

    /** 
     * 1️⃣ HEADER VALIDATION:
     * Ensuring the 'x-api-key' is present in the request.
     */
    if (!key) {
      return res.status(400).json({ 
        success: false, 
        message: 'AUTHENTICATION_REQUIRED: API Key is missing in the x-api-key header.' 
      });
    }

    /** 
     * 2️⃣ CRYPTOGRAPHIC IDENTITY LOOKUP:
     * Searching for the API Key in the persistence layer.
     * We use .lean() for maximum performance in high-traffic B2B endpoints.
     */
    const apiKeyDoc = await ApiKey.findOne({ key }).lean();

    /** 
     * 3️⃣ TENANT AUTHORIZATION:
     * If the key is not found or is revoked, the request is rejected immediately.
     */
    if (!apiKeyDoc) {
      return res.status(401).json({ 
        success: false, 
        message: 'INVALID_CREDENTIALS: Provided API key is incorrect or has been revoked.' 
      });
    }

    /** 
     * 4️⃣ CONTEXT INJECTION:
     * Attaching the companyId (Tenant) to the request object. 
     * This ensures data isolation in Multi-Tenancy operations.
     */
    req.companyId = apiKeyDoc.companyId;

    // Proceed to the protected business logic
    next();
  } catch (err) {
    /**
     * CRITICAL FAILURE LOGGING:
     * Using the internal logger (see logger.js) to track middleware exceptions.
     */
    console.error('❌ API_KEY_MIDDLEWARE_CRITICAL_FAILURE:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'INTERNAL_SERVER_ERROR: Authentication service temporarily unavailable.' 
    });
  }
};

export default apiKeyMiddleware;
