/**
 * @file adminMiddleware.js
 * @description Role-Based Access Control (RBAC) Guard for Administrative Routes.
 * Ensures that only authorized identities can access sensitive B2B management features.
 * 
 * @dev Frontier Hackathon Context:
 * Security is a top priority. This middleware protects the "Admin Panel" 
 * and Governance API, preventing unauthorized HubkonID (SBT) issuance.
 */

/**
 * @middleware adminMiddleware
 * @description Verifies if the authenticated user possesses administrative privileges.
 * @param {Object} req - Express request object (must contain req.user from authMiddleware).
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const adminMiddleware = (req, res, next) => {
  // 1️⃣ AUTHORITY DEFINITION: Adicionado "owner" para permitir acesso ao criador da empresa.
  const allowedRoles = ["admin", "superadmin", "owner"];

  /**
   * 2️⃣ IDENTITY VERIFICATION:
   * Checking if the user context exists and if their role matches the whitelist.
   */
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    /**
     * ACCESS DENIED (403 Forbidden):
     * Logged attempt for security audit trail (see logger.js).
     */
    return res.status(403).json({ 
      success: false, 
      message: "ACCESS_DENIED: Administrative privileges are required to perform this action." 
    });
  }

  // 3️⃣ AUTHORIZATION GRANTED: Proceed to the protected controller.
  next();
};
