import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Company from "../src/models/CompanyModel.js";
import Wallet from "../src/models/WalletModel.js";
import Escrow from "../src/models/EscrowModel.js";
import { createEscrow, approveEscrow, releaseEscrow } from "../src/services/escrowService.js";

async function runTest() {
  try {
    // ✅ CORREÇÃO: Conexão limpa para Mongoose 6/7/8
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] MongoDB conectado para teste full-cycle");

    // 🧹 LIMPEZA: Garante que o teste comece do zero
    await Company.deleteMany({});
    await Wallet.deleteMany({});
    await Escrow.deleteMany({});

    // 1️⃣ Criar Entidades Corporativas
    const buyerCompany = await Company.create({
      name: "Buyer Co",
      email: "buyer@example.com"
    });
    const sellerCompany = await Company.create({
      name: "Seller Co",
      email: "seller@example.com"
    });

    // 2️⃣ Criar Wallets (Motor Financeiro)
    // Nota: O checkout costuma bloquear o valor, mas aqui simulamos o fluxo direto do service
    const buyerWallet = await Wallet.create({ companyId: buyerCompany._id, balance: 1000, locked: 0 });
    const sellerWallet = await Wallet.create({ companyId: sellerCompany._id, balance: 500 });
    const platformWallet = await Wallet.create({ isPlatform: true, balance: 0 });

    console.log(`💰 [INÍCIO] Buyer: ${buyerWallet.balance} | Seller: ${sellerWallet.balance}`);

    // 3️⃣ Criar Escrow
    const escrow = await createEscrow({
      companyA: buyerCompany._id,
      companyB: sellerCompany._id,
      amount: 100,
      createdBy: buyerCompany._id
    });

    console.log(`🚀 Escrow criado: ${escrow._id}`);

    // 🛡️ Simulação de Bloqueio (Caso o service não o faça automaticamente no create)
    // Para o releaseEscrow funcionar com a nova lógica de 'locked', precisamos de saldo no cofre
    buyerWallet.balance -= 100;
    buyerWallet.locked += 100;
    await buyerWallet.save();
    console.log("🔒 Saldo de $100 movido para LOCKED (Cofre)");

    // 4️⃣ Aprovação Dupla (Dual-Approval Protocol)
    await approveEscrow(escrow._id, { companyId: buyerCompany._id, userId: buyerCompany._id });
    await approveEscrow(escrow._id, { companyId: sellerCompany._id, userId: sellerCompany._id });
    console.log("✅ Buyer e Seller aprovaram o contrato.");

    // 5️⃣ Liquidação Final (Release)
    const releaseResult = await releaseEscrow(escrow._id, { 
        companyId: buyerCompany._id, 
        role: "buyer", 
        userId: buyerCompany._id 
    });

    console.log(`🎉 [RELEASE] Fee: ${releaseResult.fee} | Net to Seller: ${releaseResult.netAmount} ${releaseResult.currency}`);

    // 6️⃣ Auditoria Final de Saldos
    const finalBuyerWallet = await Wallet.findOne({ companyId: buyerCompany._id });
    const finalSellerWallet = await Wallet.findOne({ companyId: sellerCompany._id });
    const finalPlatform = await Wallet.findOne({ isPlatform: true });

    console.log("\n============================================");
    console.log("🏛️      HUBKON FULL ESCROW TEST REPORT");
    console.log("============================================");
    console.log(`✅ Buyer Wallet:  ${finalBuyerWallet.balance} (Locked: ${finalBuyerWallet.locked})`);
    console.log(`✅ Seller Wallet: ${finalSellerWallet.balance}`);
    console.log(`🏦 PLATFORM Wallet: ${finalPlatform.balance.toFixed(2)} (Profit 🏎️)`);
    console.log("============================================\n");

    console.log("🔌 Ciclo finalizado com sucesso.");
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("❌ [TEST FAILED]:", error.message);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(1);
  }
}

runTest();
