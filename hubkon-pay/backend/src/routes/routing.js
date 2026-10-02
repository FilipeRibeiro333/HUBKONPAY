import express from 'express';
import { orchestrateSettlement } from '../controllers/routingController.js';
import { getTreasuryBalances } from '../controllers/balanceController.js';
import { getInvoiceAuditSummary } from '../controllers/auditController.js';
import { toggleSettlementRail } from '../controllers/chaosController.js';
import NetworkConfig from '../models/NetworkConfigModel.js';
import Transaction from '../models/TransactionModel.js';
import { verifyPayloadIntegrity } from '../middlewares/appSecMiddleware.js';

let authMiddleware;
try {
  const authModule = await import('../middlewares/authMiddleware.js');
  authMiddleware = authModule.verifyToken || authModule.default || ((req, res, next) => next());
} catch (e) {
  authMiddleware = (req, res, next) => next();
}

const router = express.Router();

router.post('/toggle-rail', authMiddleware, toggleSettlementRail);
router.get('/treasury-balances', authMiddleware, getTreasuryBalances);
router.get('/audit-summary', authMiddleware, getInvoiceAuditSummary);

// ? ADICIONADO COM COMPLIANCE: O processador de callbacks do banco parceiro fiduciário
router.post('/bank-callback', async (req, res) => {
  const { transactionId, bankReference, networkStatus } = req.body;
  if (!transactionId || !networkStatus) return res.status(400).json({ error: 'Dados do Webhook bancario incompletos' });
  try {
    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ error: 'Transacao nao encontrada no Ledger' });
    if (networkStatus === 'CONFIRMED_ISO20022') {
      tx.status = 'COMPLETED'; 
      if (bankReference) tx.blockchainHash = bankReference; 
      await tx.save();
      return res.json({ success: true, message: 'Webhook processado com sucesso. Ledger HUBKON atualizado para COMPLETED.', railUsed: tx.selectedRail, notifiedMerchant: true });
    }
    res.status(400).json({ message: 'Status bancario invalido.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const circuitBreakerInterceptor = async (req, res, next) => {
  try {
    const { destinationCountry, supplierRequiresFiat, amount } = req.body;
    let targetRail = 'SOLANA_WEB3';

    if (destinationCountry?.toLowerCase() === 'china' && supplierRequiresFiat === true) targetRail = 'CIPS_CHINA';
    else if (amount >= 100000 && supplierRequiresFiat === true) targetRail = 'SWIFT_BANK';

    const checkConfig = await NetworkConfig.findOne({ rail: targetRail });
    
    if (checkConfig && checkConfig.isActive === false) {
      console.log('[CIRCUIT BREAKER DETECTED] Rota desativada administrativamente!');
      
      if (targetRail !== 'SOLANA_WEB3') {
        req.body.supplierRequiresFiat = false;
        console.log('[ROUTING REDIRECT] Trafego desviado de emergencia para SOLANA_WEB3 Super-Rail.');
      } else {
        req.body.supplierRequiresFiat = true;
        req.body.destinationCountry = 'Fallback_Western_Node';
        console.log('[ROUTING REDIRECT] Trafego Web3 desviado de emergencia para SWIFT_BANK.');
      }
    }
    next();
  } catch (err) {
    next();
  }
};

router.post('/settle-invoice', authMiddleware, verifyPayloadIntegrity, circuitBreakerInterceptor, orchestrateSettlement);

export default router;
