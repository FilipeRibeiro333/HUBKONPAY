// src/workers/transferWorker.js
/**
 * Transfer Worker
 * --------------------------
 * Processes queued transfers asynchronously.
 */

import { getNext } from '../queues/transferQueue.js';
import Transfer from '../models/Transfer.js';
import { processBankTransfer } from '../providers/bankProvider.js';
import blockchain from '../utils/blockchain.js';

export function startWorker() {

  console.log("🚀 Transfer worker started...");

  setInterval(async () => {

    const job = getNext();
    if (!job) return;

    try {
      console.log("Processing transfer:", job._id);

      // Call external provider
      const result = await processBankTransfer(job);

      // Update transfer in DB
      await Transfer.findByIdAndUpdate(job._id, {
        status: result.success ? 'success' : 'failed',
        externalId: result.id,
      });

      // Log transaction in blockchain
      blockchain.addTransaction({
        type: 'external_transfer',
        transferId: job._id,
        status: result.success ? 'success' : 'failed',
        amount: job.amount,
      });

      blockchain.minePendingTransactions();

      console.log("✅ Transfer processed");

    } catch (err) {
      console.error("❌ Worker error:", err);
    }

  }, 3000); // runs every 3 seconds
}