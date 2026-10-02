import Company from "../models/CompanyModel.js";
import { logger } from "../config/logger.js";

/**
 * 💳 HUBKON AUTO-BILLING ENGINE (IMPLACÁVEL)
 */
export const processDailyBilling = async () => {
  try {
    const today = new Date();

    // 🎯 FILTRO: Se expirou e NÃO é basic, o martelo cai.
    const expiredCompanies = await Company.find({
      plan: { $in: ["pro", "enterprise"] },
      subscriptionExpiresAt: { $lt: today }
    });

    if (expiredCompanies.length === 0) {
      console.log("✅ [BILLING] Nenhuma empresa expirada hoje.");
      return;
    }

    for (let company of expiredCompanies) {
      console.log(`⚠️ [BILLING] Cortando acesso da ${company.name}...`);
      
      company.plan = "basic";
      company.subscriptionStatus = "expired"; // 📉 Rebaixado
      
      await company.save();

      logger.warn(`📉 [DOWNGRADE] ${company.name} rebaixada para BASIC.`, {
        companyId: company._id,
        expiryDate: company.subscriptionExpiresAt
      });
    }

    console.log(`✅ [BILLING] ${expiredCompanies.length} devedores suspensos.`);
  } catch (err) {
    logger.error("❌ [BILLING ERROR]:", err.message);
  }
};

