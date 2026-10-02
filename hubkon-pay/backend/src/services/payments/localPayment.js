// src/services/payments/localPayment.js
import fs from 'fs';
import path from 'path';
import Invoice from '../../models/Invoice.js';

/**
 * Local Payment Service
 * ----------------------------------
 * Confirms local payments and updates invoice records.
 * Saves proof files locally for reference/testing.
 */
export const confirmLocalPayment = async (invoiceId, proofFile) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');

  const proofPath = path.join('uploads', `${invoiceId}_${proofFile.name}`);
  fs.writeFileSync(proofPath, proofFile.data);

  invoice.status = 'paid';
  invoice.paymentMethod = 'local';
  invoice.paymentProof = proofPath;
  await invoice.save();

  return invoice;
};