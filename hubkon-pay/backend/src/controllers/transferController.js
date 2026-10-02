// Import service using ES Modules
import { createExternalTransfer } from '../services/externalTransferService.js';

/**
 * Transfer Controller
 * -------------------
 * Handles transfer-related HTTP requests
 */
export async function externalTransfer(req, res) {
  try {
    // Extract request data
    const transferData = {
      userId: req.body.userId,
      fromWalletId: req.body.fromWalletId,
      amount: req.body.amount,
      currency: req.body.currency,
      destinationType: req.body.destinationType,
      destinationAccount: req.body.destinationAccount
    };

    // Call service layer
    const transfer = await createExternalTransfer(transferData);

    // Send response
    res.status(201).json({
      message: 'External transfer created successfully',
      transfer
    });

  } catch (err) {
    console.error('❌ Transfer Controller Error:', err);

    res.status(500).json({
      error: 'Error creating external transfer'
    });
  }
}