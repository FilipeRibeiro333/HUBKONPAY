import Company from "../models/CompanyModel.js";

/**
 * 📈 UPDATE REPUTATION SERVICE
 * Automatiza o ganho de confiança e limites de crédito (Credit Scoring Engine).
 */
export const updateCompanyReputation = async (companyId, amount, success = true) => {
  // 1. Define os incrementos baseados no sucesso ou falha (Recompensa vs Penalização)
  const updateFields = success 
    ? { 
        $inc: { 
          creditScore: 2, 
          successfulEscrows: 1, 
          totalVolumeUSD: amount,
          maxAdvanceLimit: amount * 0.10 // 10% do volume vira bónus de limite de crédito
        } 
      }
    : { 
        $inc: { creditScore: -10, disputedEscrows: 1 },
        $set: { isEligibleForAdvance: false } // Calote corta o crédito imediatamente!
      };

  // 2. Executa a atualização (Sem warnings do Mongoose)
  const updatedCompany = await Company.findByIdAndUpdate(
    companyId, 
    updateFields, 
    { returnDocument: 'after' } // ✅ FIXED: Substituído 'new: true' para evitar deprecation
  );

  if (!updatedCompany) return null;

  // 3. 🧠 LÓGICA DE INTELIGÊNCIA: Promoção Automática para VIP
  // Se o score atingir 60, o sistema confia na empresa para Antecipação (Turbo Profit 5%)
  if (updatedCompany.creditScore >= 60 && !updatedCompany.isEligibleForAdvance) {
    updatedCompany.isEligibleForAdvance = true;
    await updatedCompany.save();
    console.log(`🚀 [RISK] Entidade ${updatedCompany.name} graduada para VIP (Crédito Ativo)`);
  }

  return updatedCompany;
};
