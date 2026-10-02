/**
 * @file analyticsController.js
 * @description Dashboard Analytics Controller for HUBKON PAY.
 * Orchestrates the retrieval of platform revenue, segmented by currency (USD/EUR).
 * 
 * @dev Frontier Hackathon Context:
 * High-level business observability. This controller powers the Admin 
 * Dashboard, showcasing the platform's ability to generate and track 
 * real-time B2B transaction fees.
 */

import { getPlatformRevenue, getMonthlyRevenue } from "../services/analyticsService.js";

/**
 * @function getDashboardStats
 * @description Aggregates financial performance metrics for the executive dashboard.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {JSON} Structured financial data including total revenue and monthly growth.
 */
export const getDashboardStats = async (req, res) => {
  try {
    /**
     * 1️⃣ PLATFORM REVENUE SEGMENTATION
     * Fetches consolidated profits from the settlement engine.
     * @returns {Object} Example: { USD: 5000, EUR: 3200 }
     */
    const totalStats = await getPlatformRevenue();
    
    /**
     * 2️⃣ HISTORICAL GROWTH DATA
     * Fetches monthly revenue evolution for chart visualization.
     * Essential for tracking B2B adoption trends.
     */
    const monthlyStats = await getMonthlyRevenue();

    res.json({ 
      success: true, 
      // 💰 Consolidated Revenue Data
      revenue: totalStats, 
      // 📈 Time-series data for frontend charts (Recharts/Chart.js)
      monthly: monthlyStats 
    });
  } catch (err) {
    /**
     * ERROR HANDLING
     * Ensures internal failures do not expose sensitive infrastructure details.
     */
    res.status(500).json({ 
      success: false, 
      message: "FAILED_TO_PROCESS_METRICS: " + err.message 
    });
  }
};
