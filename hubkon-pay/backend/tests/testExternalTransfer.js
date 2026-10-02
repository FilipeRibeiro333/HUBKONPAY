// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { createExternalTransfer } from '../src/services/externalTransferService.js';

/**
 * Test Script: External Transfer
 * -----------------------------
 * Simulates an external transfer flow:
 * - Connects to MongoDB
 * - Calls service
 * - Prints result
 */
async function main() {
  try {
    // 1️⃣ Connect to MongoDB (modern Mongoose - no deprecated options)
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB conectado');

    // 2️⃣ Create test transfer data
    const testData = {
      userId: new mongoose.Types.ObjectId(), // fake user
      fromWalletId: 'wallet_test_001',
      amount: 100,
      currency: 'USD',
      destinationType: 'bank',
      destinationAccount: '1234567890'
    };

    console.log('🚀 Creating external transfer...');

    // 3️⃣ Call service
    const result = await createExternalTransfer(testData);

    // 4️⃣ Output result
    console.log('✅ Transfer Result:');
    console.log({
      id: result._id,
      status: result.status,
      amount: result.amount,
      externalId: result.externalId
    });

  } catch (error) {
    console.error('❌ Erro em testExternalTransfer:', error);

  } finally {
    // 5️⃣ Disconnect from DB
    await mongoose.disconnect();
    console.log('🔌 MongoDB desconectado.');
  }
}

// Run test
main();