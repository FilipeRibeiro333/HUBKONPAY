/**
 * @file helmetConfig.js
 * @description HTTP Security Header Middleware for HUBKON PAY.
 * Implements strict security policies to mitigate common web vulnerabilities.
 * 
 * @dev Frontier Hackathon Context:
 * In a B2B payment ecosystem, frontend security is as critical as 
 * on-chain security. This config prevents XSS, Clickjacking, and Sniffing.
 */

const helmet = require('helmet');

const helmetConfig = helmet({
  /**
   * CONTENT SECURITY POLICY (CSP)
   * Restricts where resources (scripts, styles) can be loaded from.
   * @notice Prevents Cross-Site Scripting (XSS) by allowing only self-hosted assets.
   */
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"], // Disables plugins like Flash
      upgradeInsecureRequests: [], // Enforces HTTPS
    },
  },
  
  /**
   * REFERRER POLICY
   * @notice Set to 'no-referrer' to hide sensitive B2B URL parameters from external sites.
   */
  referrerPolicy: { policy: 'no-referrer' },
  
  /**
   * FRAMEGUARD
   * @notice Prevents Clickjacking by disallowing the app to be embedded in iframes.
   */
  frameguard: { action: 'deny' },
  
  /**
   * HTTP STRICT TRANSPORT SECURITY (HSTS)
   * @notice Enforces SSL/TLS for 1 year, including all subdomains.
   */
  hsts: {
    maxAge: 31536000, // 1 Year in seconds
    includeSubDomains: true,
    preload: true,
  },
});

module.exports = helmetConfig;
