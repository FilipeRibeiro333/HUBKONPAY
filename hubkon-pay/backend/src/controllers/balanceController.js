import Transaction from "../models/TransactionModel.js";

export const getTreasuryBalances = async (req, res) => {
  try {
    const balanceAggregation = await Transaction.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: { rail: "$selectedRail", currency: "$currency" },
          totalVolume: { $sum: "$amount" },
          totalNet: { $sum: "$netAmount" },
          totalFeesEarned: { $sum: "$feeApplied" },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      SOLANA_WEB3: { USD: 0, EUR: 0, CNH: 0, AOA: 0 },
      SWIFT_BANK: { USD: 0, EUR: 0, CNH: 0, AOA: 0 },
      CIPS_CHINA: { USD: 0, EUR: 0, CNH: 0, AOA: 0 }
    };

    let totalFeesUSD = 0;

    balanceAggregation.forEach(item => {
      const { rail, currency } = item._id;
      if (stats[rail] && stats[rail].hasOwnProperty(currency)) {
        stats[rail][currency] = item.totalNet;
      }
      if (currency === "USD") totalFeesUSD += item.totalFeesEarned;
    });

    return res.status(200).json({
      success: true,
      message: "Análise de liquidez e balanços de tesouraria consolidada.",
      timestamp: new Date(),
      feesRetainedUSD: totalFeesUSD,
      networkBalances: stats
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Falha crítica ao consolidar balanços.", error: error.message });
  }
};
