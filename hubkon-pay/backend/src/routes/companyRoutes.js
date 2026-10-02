import { Router } from 'express';
import { signupCompany } from '../controllers/signupCompanyController.js';
import { getCompanyDashboard } from '../controllers/dashboardController.js';
import { authorize } from '../middlewares/authorize.js';

// 🚀 IMPORTAÇÃO DO SERVICE DE PLANOS
import { renewSubscription } from '../services/subscriptionService.js';

const router = Router();

// ----------------------------------
// Public Signup (Criação de Empresa)
// ----------------------------------
router.post('/signup', signupCompany);

// ----------------------------------
// Private Dashboard (Dados da Empresa)
// ----------------------------------
router.get('/dashboard', authorize(), getCompanyDashboard);

/**
 * ----------------------------------
 * 💳 SUBSCRIPTION UPGRADE
 * Rota para mudar o plano (Basic -> Pro -> Enterprise)
 * Chamada pela sua nova página de configurações no Front
 * ----------------------------------
 */
router.post('/subscription/renew', authorize(), async (req, res) => {
  try {
    const { newPlan } = req.body;
    
    // O seu middleware authorize() deve anexar o companyId ao req.user
    const companyId = req.user.companyId || req.user._id; 

    if (!companyId) {
      return res.status(400).json({ 
        success: false, 
        message: "ID da empresa não identificado na sessão." 
      });
    }

    // Chama o seu service que orquestra a mudança no banco
    const result = await renewSubscription(companyId, newPlan);
    
    res.json(result);
  } catch (error) {
    console.error("❌ [UPGRADE_ERROR]:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Falha ao processar upgrade de plano.",
      error: error.message 
    });
  }
});

export default router;
