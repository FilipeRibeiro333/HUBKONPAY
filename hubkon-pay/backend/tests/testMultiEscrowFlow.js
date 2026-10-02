// tests/testMultiEscrowFlow.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Wallet from "../src/models/WalletModel.js";
import Escrow from "../src/models/EscrowModel.js";
import {
  createEscrow,
  approveEscrow,
  releaseEscrow, // 👈 Importado para libertar os fundos
} from "../src/services/escrowService.js";

const runTest = async () => {
  try {
    // 1️⃣ Conectar MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado com sucesso");

    // 2️⃣ Criar IDs únicos para este teste (evita conflitos)
    const companyAId = new mongoose.Types.ObjectId();
    const companyBId = new mongoose.Types.ObjectId();

    // 3️⃣ Preparar Wallets
    const platformWallet = await Wallet.findOne({ isPlatform: true }) || await Wallet.create({
      balance: 0,
      isPlatform: true,
    });

    const walletA = await Wallet.create({
      companyId: companyAId,
      balance: 1000,
      locked: 0,
      isPlatform: false,
    });

    const walletB = await Wallet.create({
      companyId: companyBId,
      balance: 500,
      locked: 0,
      isPlatform: false,
    });

    console.log("✅ Wallets de teste prontas (A: 1000, B: 500)");

    // 4️⃣ Criar Escrow (100€)
    const testUserId = new mongoose.Types.ObjectId();
    const escrow = await createEscrow({
      companyA: companyAId,
      companyB: companyBId,
      amount: 100,
      conditions: [],
      createdBy: testUserId,
    });

    console.log("✅ Escrow criado (ID):", escrow._id.toString());

    // 5️⃣ Aprovações (Buyer + Seller)
    // Passamos o companyId para o service identificar quem está a aprovar
    await approveEscrow(escrow._id, { companyId: companyAId });
    console.log("✅ Buyer aprovou");

    await approveEscrow(escrow._id, { companyId: companyBId });
    console.log("✅ Seller aprovou");

    // 6️⃣ LIBERAR OS FUNDOS (O PASSO FINAL PARA O LUCRO)
    // --------------------------------------------------
    console.log("🚀 Executando Release do Escrow...");
    
    // O Buyer (Company A) autoriza o pagamento final
    const releaseResult = await releaseEscrow(escrow._id, { 
      companyId: companyAId 
    });

    console.log(`🎉 RELEASE CONCLUÍDO!`);
    console.log(`👉 Taxa da Plataforma: ${releaseResult.fee}`);
    console.log(`👉 Valor Líquido para Vendedor: ${releaseResult.finalAmount}`);

    // 7️⃣ CONFERIR SALDOS FINAIS (A HORA DA VERDADE)
    // --------------------------------------------------
    const finalEscrow = await Escrow.findById(escrow._id);
    const updatedWalletA = await Wallet.findById(walletA._id);
    const updatedWalletB = await Wallet.findById(walletB._id);
    const updatedPlatform = await Wallet.findById(platformWallet._id);

    console.log("\n📊 --- RELATÓRIO FINAL ---");
    console.log("💰 Wallet A (Buyer):", updatedWalletA.balance, "(Esperado: 900)");
    console.log("💰 Wallet B (Seller):", updatedWalletB.balance, `(Esperado: ${500 + releaseResult.finalAmount})`);
    console.log("🏦 PLATFORM WALLET (TEU LUCRO):", updatedPlatform.balance, "(O dinheiro da Ford Raptor! 🏎️)");
    console.log("📜 Status do Escrow:", finalEscrow.status, "(Esperado: released)");

    // 8️⃣ Desconectar
    await mongoose.disconnect();
    console.log("\n✅ Teste multi-escrow finalizado com sucesso!");

  } catch (error) {
    console.error("❌ Erro no teste multi-escrow:", error.message || error);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
};

runTest();