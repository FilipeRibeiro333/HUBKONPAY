import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Company from "../src/models/CompanyModel.js";
import Wallet from "../src/models/WalletModel.js";
import Escrow from "../src/models/EscrowModel.js"; // Import missing
import { createEscrow, approveEscrow, releaseEscrow } from "../src/services/escrowService.js";

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para teste REAL com Webhooks");

    // 🧹 Reset Completo
    await Company.deleteMany({});
    await Wallet.deleteMany({});
    await Escrow.deleteMany({});

    // 🏢 Criar empresas com o TEU Webhook Real
    const compA = await Company.create({
      name: "Buyer Corp",
      email: "buyer@hubkon.com",
    });

    const compB = await Company.create({
      name: "Seller Ltd",
      email: "seller@hubkon.com",
      // 🔥 O TEU LINK REAL AQUI:
      webhookUrl: "https://webhook.site", 
      webhookSecret: "hubkon_secure_secret_2024"
    });

    // 💰 Inicializar Wallets
    await Wallet.create({ isPlatform: true, balance: 0 });
    const walletA = await Wallet.create({ companyId: compA._id, balance: 1000, locked: 0 });
    const walletB = await Wallet.create({ companyId: compB._id, balance: 500 });

    console.log(`💰 [SALDO] Buyer: ${walletA.balance} | Seller: ${walletB.balance}`);

    // 🤝 Criar Escrow
    const escrow = await createEscrow({
      companyA: compA._id,
      companyB: compB._id,
      amount: 100,
      createdBy: compA._id
    });

    console.log("🚀 Escrow criado ID:", escrow._id);

    // 🔒 Bloqueio de Fundos (Simulação do Checkout)
    walletA.balance -= 100;
    walletA.locked += 100;
    await walletA.save();
    console.log("🔒 $100 movidos para o Cofre (Locked)");

    // ✅ Aprovações Duplas
    await approveEscrow(escrow._id, { companyId: compA._id });
    await approveEscrow(escrow._id, { companyId: compB._id });
    console.log("✅ Escrow aprovado por ambas as partes.");

    // 🎉 RELEASE (Dispara o Webhook para o teu link automaticamente)
    console.log("📡 Disparando Liberação e Webhook...");
    const result = await releaseEscrow(escrow._id, { companyId: compA._id });

    console.log(`🎉 [SUCCESS] Fee: ${result.fee} | Net to Seller: ${result.netAmount}`);

    // 📊 Auditoria Final
    const fA = await Wallet.findOne({ companyId: compA._id });
    const fB = await Wallet.findOne({ companyId: compB._id });
    const fP = await Wallet.findOne({ isPlatform: true });

    console.log("\n============================================");
    console.log("📡   HUBKON WEBHOOK + ESCROW TEST REPORT");
    console.log("============================================");
    console.log(`✅ Buyer Wallet:  ${fA.balance} (Locked: ${fA.locked})`);
    console.log(`✅ Seller Wallet: ${fB.balance}`);
    console.log(`🏦 Platform Profit: ${fP.balance.toFixed(2)} (Profit 🏎️)`);
    console.log("============================================\n");

    console.log("💡 Verificaste o teu painel no Webhook.site? O JSON deve estar lá!");
    
    await mongoose.disconnect();
    console.log("🔌 Teste finalizado com sucesso.");

  } catch (err) {
    console.error("❌ Test failed:", err.message);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(1);
  }
};

runTest();
