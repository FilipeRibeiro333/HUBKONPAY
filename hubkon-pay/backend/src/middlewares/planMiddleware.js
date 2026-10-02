import Company from "../models/companyModel.js";

/**
 * MOTOR DE REGRAS DE NEGÓCIO - HUBKON PAY
 * Este middleware gere a hierarquia de lucro e permissões.
 */

export const checkPlanAccess = (requiredTier) => {
  return async (req, res, next) => {
    try {
      // 1. REGRA SOBERANA (SuperAdmin tem passe livre total)
      if (req.user?.role === "superadmin" || req.user?.isSuperAdmin) {
        req.planConfig = { escrowFee: 0.015, canAdvance: true, hasBlockchain: true }; // Taxa mínima para o Admin
        return next();
      }

      // 2. BUSCA A EMPRESA E O PLANO ATUAL
      const company = await Company.findById(req.user.companyId);
      if (!company) return res.status(404).json({ message: "BUSINESS_UNIT_NOT_FOUND" });

      // 3. DEFINIÇÃO DA HIERARQUIA E REGRAS FINANCEIRAS
      const tierConfig = {
        basic: { 
          level: 1, 
          escrowFee: 0.03,      // 3.0% (Lucro alto no varejo)
          fixedFee: 0.50,       // Taxa de processamento
          canAdvance: false,    // Bloqueado (Força o Upgrade)
          hasPdf: false, 
          hasBlockchain: false 
        },
        pro: { 
          level: 2, 
          escrowFee: 0.02,      // 2.0% (Equilíbrio)
          fixedFee: 0.25, 
          canAdvance: true,     // Diferencial Pro
          hasPdf: true, 
          hasBlockchain: false 
        },
        enterprise: { 
          level: 3, 
          escrowFee: 0.015,     // 1.5% (Atrai volume)
          fixedFee: 0.00,       // Isento
          canAdvance: true, 
          hasPdf: true, 
          hasBlockchain: true   // Diferencial Enterprise
        }
      };

      const userPlan = company.plan.toLowerCase() || "basic";
      const currentConfig = tierConfig[userPlan];
      const requiredLevel = tierConfig[requiredTier].level;

      // 4. VERIFICAÇÃO DE VALIDADE DA ASSINATURA
      const now = new Date();
      if (company.subscriptionExpiresAt && company.subscriptionExpiresAt < now) {
        return res.status(402).json({ 
          success: false, 
          message: "SUBSCRIPTION_EXPIRED", 
          action: "REDIRECT_TO_PAYMENTS" 
        });
      }

      // 5. VALIDAÇÃO DE ACESSO AO RECURSO
      if (currentConfig.level < requiredLevel) {
        return res.status(403).json({ 
          success: false, 
          message: `UPGRADE_REQUIRED: Este recurso exige plano ${requiredTier.toUpperCase()}`,
          currentPlan: userPlan
        });
      }

      // 6. INJEÇÃO DE CONFIGURAÇÃO (O pulo do gato 🐱)
      // Passamos os valores de taxas para o próximo controller/serviço usar
      req.planConfig = currentConfig;

      next();
    } catch (err) {
      console.error("Critical Plan Engine Error:", err);
      res.status(500).json({ message: "INTERNAL_PLAN_VALIDATION_ERROR" });
    }
  };
};
