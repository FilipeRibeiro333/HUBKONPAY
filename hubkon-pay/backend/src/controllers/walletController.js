/**
 * @file walletController.js
 * @description Financial Custody & Wallet Provisioning Controller.
 * Orchestrates the creation of corporate digital vaults for B2B liquidity.
 * 
 * @dev Frontier Hackathon Context:
 * Critical infrastructure layer. This controller triggers the generation of 
 * hybrid wallets, linking the B2B Tenant (Company) to the Hubkon Sovereign Ledger.
 */

import { createWallet } from "../services/walletService.js";

/**
 * @function createWalletController
 * @description Initializes a dedicated financial wallet for a specific company.
 * @route POST /api/wallets/create
 * @access Private (Admin/System Only)
 */
export const createWalletController = async (req, res) => {
  try {
    /** 
     * TENANT IDENTIFICATION:
     * Mapping the new wallet to a unique corporate entity (Multi-tenancy).
     */
    const { companyId } = req.body;

    /**
     * SERVICE LAYER EXECUTION:
     * createWallet handles the cryptographic generation and database persistence.
     * @returns {Object} The newly provisioned wallet metadata.
     */
    const wallet = await createWallet(companyId);

    res.json({ 
      success: true, 
      message: "Digital vault provisioned successfully for the tenant.",
      wallet 
    });

  } catch (err) {
    /**
     * ERROR HANDLING:
     * Capturing failures in the cryptographic provisioning process.
     */
    res.status(400).json({ 
      success: false,
      error: "WALLET_PROVISIONING_FAILED: " + err.message 
    });
  }
};
