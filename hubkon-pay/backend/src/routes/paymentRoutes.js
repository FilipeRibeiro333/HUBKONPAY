/**
 * HUBKON PAY - PAYMENT ROUTES
 * Layer 1 & 2 Financial Gateway
 */
import { Router } from 'express';
import { initiateTransfer } from '../services/paymentService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// GET: Check payment system health
router.get('/', (req, res) => {
  res.status(200).json({ status: 'Service Operational', layer: 'Elite' });
});

// POST: Create a controlled payment
router.post('/', authMiddleware, async (req, res) => {
  const { amount, currency, destination } = req.body;
  const userId = req.user.id;

  if (!amount || !currency || !destination) {
    return res.status(400).json({ error: 'Missing financial parameters' });
  }

  try {
    // Calling the Intelligence Service to decide: Instant, Timelock or Multisig
    const transaction = await initiateTransfer(amount, destination, userId);
    
    res.status(201).json({
      message: 'Transaction processed by HUBKON Shield',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ error: 'Transaction rejected by Security Core' });
  }
});

export default router;
