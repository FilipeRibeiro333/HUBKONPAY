import Transaction from "../models/transactionModel.js";

/**
 * 1️⃣ RECEITA TOTAL POR MOEDA
 * Garante que o Dashboard mostre cartões separados para USD e EUR.
 */
export const getPlatformRevenue = async () => {
  const result = await Transaction.aggregate([
    { 
      $match: { 
        status: { $in: ["COMPLETED", "ADVANCED"] }, // Apenas lucro real
        feeApplied: { $gt: 0 }                      // Onde houve taxa
      } 
    },
    { 
      $group: { 
        _id: "$currency", // 👈 Segrega por USD, EUR, AOA, etc.
        total: { $sum: "$feeApplied" } 
      } 
    }
  ]);
  
  // Transforma o array em objeto para fácil leitura no Frontend: { USD: 500, EUR: 300 }
  return result.reduce((acc, curr) => {
    acc[curr._id] = curr.total;
    return acc;
  }, {});
};

/**
 * 2️⃣ CRESCIMENTO MENSAL
 * Prepara os dados para o gráfico de barras/linhas.
 */
export const getMonthlyRevenue = async () => {
  return await Transaction.aggregate([
    { 
      $match: { 
        status: { $in: ["COMPLETED", "ADVANCED"] },
        feeApplied: { $gt: 0 }
      } 
    },
    { 
      $group: { 
        _id: { 
          year: { $year: "$createdAt" }, 
          month: { $month: "$createdAt" },
          currency: "$currency" 
        }, 
        total: { $sum: "$feeApplied" } 
      } 
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
};
