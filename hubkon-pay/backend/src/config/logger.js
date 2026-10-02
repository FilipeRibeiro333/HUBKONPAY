/**
 * @file logger.js
 * @description Centralized Logging & Audit Engine for HUBKON PAY.
 * Implements persistent logging for financial forensics and security monitoring.
 * 
 * @dev Frontier Hackathon Context:
 * In a B2B payment ecosystem, having an immutable audit trail of server events 
 * is mandatory for compliance. This engine tracks profits, risks, and errors.
 */

import { createLogger, format, transports } from 'winston';

/**
 * 🛰️ HUBKON CENTRAL LOGGER (V.1005 ELITE)
 * Configured for multi-transport output (Console + Persistent Files).
 */
export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }), // Captures full stack traces for debugging
    format.json() // Structured logging for easy parsing by ELK/Grafana
  ),
  defaultMeta: { 
    service: 'hubkon-pay-backend', 
    env: process.env.NODE_ENV || 'development' 
  },
  transports: [
    /**
     * CONSOLE TRANSPORT
     * Real-time visibility for the development team.
     */
    new transports.Console(), 

    /**
     * ERROR LOGGING (CRITICAL)
     * Stores system crashes and failed financial logic.
     */
    new transports.File({ filename: 'logs/error.log', level: 'error' }),    

    /**
     * SECURITY LOGGING (WARNING)
     * Tracks rate-limiting hits, failed logins, and potential intrusion attempts.
     */
    new transports.File({ filename: 'logs/security.log', level: 'warn' }),  

    /**
     * AUDIT LOGGING (INFO)
     * Records successful B2B settlements, revenue generation, and plan upgrades.
     */
    new transports.File({ filename: 'logs/audit.log', level: 'info' })      
  ]
});

/**
 * @notice Default export for seamless integration with the Express.js middleware.
 */
export default logger;
