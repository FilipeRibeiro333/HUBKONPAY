// services/externalTransferService.js

// ✅ Import model (ES Modules standard)
import Transfer from '../models/Transfer.js';
import blockchain from '../utils/blockchain.js';

/**
 * createExternalTransfer
 * ----------------------------------------
 * Handles external transfers lifecycle
 *
 * FLOW:
 * 1. Validate input
 * 2. Persist transfer (DB)
 * 3. Log to blockchain (audit trail)
 * 4. Mine block (immutability)
 * 5. Call external provider (simulated for now)
 * 6. Update transfer status
 * 7. Log final state to blockchain
 *
 * NOTE:
 * - External provider is currently simulated
 * - Ready for real integration (Stripe, Bank API)
 */

export async function createExternalTransfer(data) {
  try {
    console.log("🚀 Starting external transfer...");

    // 1️⃣ Basic validation (important for production safety)
    if (!data.userId || !data.amount || !data.destinationAccount) {
      throw new Error("Missing required fields");
    }

    // 2️⃣ Create and save transfer
    const transfer = new Transfer({
      ...data,
      status: 'pending'
    });

    await transfer.save();

    console.log("✅ Transfer saved in DB:", transfer._id);

    // 3️⃣ Blockchain log (initial state)
    blockchain.addTransaction({
      type: 'external_transfer_created',
      transferId: transfer._id,
      userId: transfer.userId,
      amount: transfer.amount,
      currency: transfer.currency,
      destinationType: transfer.destinationType,
      destinationAccount: transfer.destinationAccount,
      status: 'pending',
      timestamp: Date.now()
    });

    blockchain.minePendingTransactions();

    console.log("⛓️ Blockchain recorded (creation)");

    // 4️⃣ Simulate external provider (sandbox)
    const success = Math.random() > 0.1;

    transfer.status = success ? 'success' : 'failed';
    transfer.externalId = `EXT-${Date.now()}`;

    await transfer.save();

    console.log("🌍 External provider response:", transfer.status);

    // 5️⃣ Blockchain log (final state)
    blockchain.addTransaction({
      type: 'external_transfer_updated',
      transferId: transfer._id,
      status: transfer.status,
      externalId: transfer.externalId,
      timestamp: Date.now()
    });

    blockchain.minePendingTransactions();

    console.log("⛓️ Blockchain recorded (final)");

    return transfer;

  } catch (error) {
    console.error("❌ External Transfer Error:", error.message);
    throw error;
  }
}