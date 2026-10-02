import { initiateTransfer } from './services/paymentService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
  // Liga à base de dados primeiro
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🚀 STARTING HUBKON SYSTEM TEST...");

  // Geramos ObjectIds válidos para o teste não dar erro de validação
  const validUserTestId = new mongoose.Types.ObjectId(); 
  const validDestTestId = new mongoose.Types.ObjectId();

  try {
    // TESTE 1: Enviar 5.000 USD (Deve ativar o TIMELOCK)
    console.log("\n--- TEST 1: MEDIUM VALUE (TIMELOCK) ---");
    const tx = await initiateTransfer(5000, validDestTestId, validUserTestId);
    
    if (tx && tx.status === 'TIMELOCK_ACTIVE') {
      console.log("✅ SUCCESS: Transaction held in Timelock.");
      console.log(`📧 Check your email (${process.env.ADMIN_EMAIL})! An alert should have been sent.`);
      
      // TESTE 2: Simular o "Salto no Tempo" para o Worker
      console.log("\n--- TEST 2: PREPARING FOR WORKER EXECUTION ---");
      tx.releaseAt = new Date(Date.now() - 1000); // Define a libertação para 1 segundo atrás
      await tx.save();
      console.log("✅ SUCCESS: Time manipulated in Database.");
      console.log("👉 Now run: node src/workers/executioner.js to see it complete!");
    }

  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
