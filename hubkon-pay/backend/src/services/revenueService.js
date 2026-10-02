/**
 * @file analyticsService.js
 * @description Multi-Currency Revenue & Performance Analytics Engine.
 * Aggregates platform profits (Escrow fees) and transaction volumes for B2B reporting.
 * 
 * @dev Frontier Hackathon Context:
 * "The Profit Engine". This service powers the Executive Dashboard, providing 
 * cryptographic and financial transparency on the platform's 2% to 5% fee generation.
 */

import Transaction from "../models/TransactionModel.js";

/**
 * @function getPlatformGains
 * @description Calculates consolidated platform revenue segmented by currency (USD/EUR/AOA).
 * @returns {Promise<Object>} Structured report with revenue, volume, and transaction counts.
 */
export const getPlatformGains = async () => {
  /** 
   * 1️⃣ MULTI-CURRENCY PROFIT AGGREGATION
   * Using MongoDB Aggregation Pipeline for high-performance financial calculation.
   */
  const stats = await Transaction.aggregate([
    { 
      $match: { 
        type: "escrow_released", 
        feeApplied: { $exists: true, $gt: 0 } 
      } 
    },
    { 
      /** 
       * GROUPING LOGIC:
       * Aggregating totals by currency identifier.
       */
      $group: { 
        _id: "$currency", 
        totalRevenue: { $sum: "$feeApplied" },
        totalVolume: { $sum: "$amount" },
        count: { $sum: 1 }
      } 
    }
  ]);

  // Fallback: Returns zeroed structure if no data exists in the ledger
  if (!stats.length) {
    return { usd: { revenue: 0, volume: 0 }, eur: { revenue: 0, volume: 0 }, count: 0 };
  }

  /** 
   * 2️⃣ REPORT SYNTHESIS
   * Organizing raw aggregation data into a dashboard-friendly format.
   */
  const report = {
    totalTxCount: stats.reduce((acc, curr) => acc + curr.count, 0),
    currencies: {}
  };

  stats.forEach(item => {
    report.currencies[item._id || 'USD'] = {
      revenue: item.totalRevenue,
      volume: item.totalVolume
    };
  });

  return report;
};

/**
 * @function getMonthlyRevenue
 * @description Generates time-series data for monthly revenue growth charts.
 * @param {string} currency - The target currency for the report (Default: USD).
 * @returns {Promise<Array>} Monthly profit evolution sorted by date.
 */
export const getMonthlyRevenue = async (currency = "USD") => {
  return await Transaction.aggregate([
    { 
      $match: { 
        type: "escrow_released", 
        currency: currency 
      } 
    },
    {
      /** 
       * TIME-SERIES GROUPING:
       * Extracting Year and Month from the createdAt timestamp.
       */
      $group: {
        _id: { 
          year: { $year: "$createdAt" }, 
          month: { $month: "$createdAt" } 
        },
        monthlyRevenue: { $sum: "$feeApplied" }
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } }
  ]);
};
