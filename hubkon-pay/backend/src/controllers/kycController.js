/**
 * @file kycController.js
 * @description Identity Verification & Compliance Onboarding Controller.
 * Handles the collection and processing of "Know Your Customer" (KYC) documentation.
 * 
 * @dev Frontier Hackathon Context:
 * Crucial for B2B trust. This controller acts as the gatekeeper for issuing 
 * HubkonID (SBTs), ensuring all network participants are verified and risk-assessed.
 */

import { createKYC } from "../services/kyc/kycService.js";

/**
 * @function submitKYC
 * @description Processes the uploaded identity documents and creates a KYC record.
 * @route POST /api/kyc/submit
 * @access Private (Authenticated User)
 */
export const submitKYC = async (req, res) => {
  try {
    /** 
     * IDENTITY CONTEXT:
     * Mapping the submission to the authenticated user ID.
     */
    const userId = req.user?.id || req.user?.userId;

    /**
     * SERVICE LAYER INTEGRATION:
     * createKYC handles document storage (AWS S3/IPFS) and initial database entry.
     * @param {Object} req.body - Metadata and user details.
     * @param {Object} req.files - Identity documents (Passport, License, Proof of Residence).
     */
    const kyc = await createKYC(userId, req.body, req.files);

    res.status(201).json({
      success: true,
      message: "KYC documentation submitted successfully for review.",
      kyc
    });

  } catch (error) {
    /**
     * ERROR HANDLING:
     * Ensuring failure logs are captured without exposing sensitive validation logic.
     */
    console.error("❌ KYC_SUBMISSION_ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: "INTERNAL_KYC_PROCESSING_ERROR: Failed to upload or verify documents."
    });
  }
};
