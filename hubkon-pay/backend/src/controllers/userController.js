/**
 * @file userController.js
 * @description User Directory & Identity Management Controller.
 * Provides administrative visibility over the platform's global user base.
 * 
 * @dev Frontier Hackathon Context:
 * Essential for auditing and B2B governance. This controller allows 
 * administrators to cross-reference database identities before 
 * authorizing on-chain Soulbound Token (SBT) operations.
 */

import User from "../models/userModel.js";

/**
 * @function getAllUsers
 * @description Retrieves a list of all registered users within the Hubkon ecosystem.
 * @route GET /api/users
 * @access Private (Admin Only)
 */
export const getAllUsers = async (req, res) => {
  try {
    /** 
     * DATA PRIVACY COMPLIANCE:
     * We use .select("-password") to ensure that cryptographic hashes 
     * are never exposed in the API response, following Zero-Trust principles.
     */
    const users = await User.find().select("-password");

    // Returning the sanitized user directory
    res.json(users);

  } catch (err) {
    /**
     * ERROR HANDLING:
     * Capturing internal failures during the retrieval process.
     */
    res.status(500).json({ 
      success: false,
      error: "FAILED_TO_RETRIEVE_USER_DIRECTORY: " + err.message 
    });
  }
};
