// src/controllers/dashboardController.js

import Company from "../models/CompanyModel.js";
import Wallet from "../models/WalletModel.js";
import Transaction from "../models/TransactionModel.js";

/**
 * CLIENT DASHBOARD
 * Returns company info, wallet balance, and last 20 transactions
 */
export const getCompanyDashboard = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const company = await Company.findOne({ owner: userId });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const wallet = await Wallet.findOne({ companyId: company._id }) || { balance: 0 };

    const transactions = await Transaction.find({
      $or: [
        { from: company._id },
        { to: company._id },
        { company: company._id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      success: true,
      company,
      wallet,
      transactions,
    });

  } catch (err) {
    console.error("getCompanyDashboard error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PLATFORM DASHBOARD
 * Returns platform revenue aggregated by currency (sum of fees)
 */
export const getPlatformDashboard = async (req, res) => {
  try {
    const revenue = await Transaction.aggregate([
      { $group: { _id: "$currency", totalFees: { $sum: "$feeApplied" } } }
    ]);

    return res.json({
      success: true,
      revenue,
    });

  } catch (error) {
    console.error("getPlatformDashboard error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};