import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Wallet from "../src/models/WalletModel.js";
import Company from "../src/models/CompanyModel.js";
import Escrow from "../src/models/EscrowModel.js";
import Transaction from "../src/models/TransactionModel.js";
import { createCheckoutSession } from "../src/controllers/checkoutController.js";
import { approveEscrow, releaseEscrow } from "../src/services/escrowService.js";

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para ciclo completo: Checkout + Release");

    // Limpeza Total para Auditoria
    await Company.deleteMany({});
    await Wallet.deleteMany({});
    await Escrow.deleteMany({});
    await Transaction.deleteMany({});

    // 1️⃣ Setup de Entidades
    const buyer = await Company.create({ name: "Buyer Corp", email: "buyer@hubkon.com" });
    const seller = await Company.create({ name: "Seller Ltd", email: "seller@hubkon.com" });

    // 2️⃣ Setup de Wallets (O motor da Ford Raptor 🏎️)
    await Wallet.create({ companyId: buyer._id, balance: 1000, locked: 0 });
    await Wallet.create({ companyId: seller._id, balance: 500, locked: 0 });
    await Wallet.create({ isPlatform: true, balance: 0 });

    console.log(`💰 [INÍCIO] Buyer: 1000 | Seller: 500`);

    // 3️⃣ Simulação de Request para Checkout (A Lógica do Controller)
    let escrowId;
    const req = {
      body: { 
        companyA: buyer._id.toString(), // Faltava este campo!
        companyB: seller._id.toString(), 
        amount: 100, 
        currency: "USD" 
      },
      user: { _id: new mongoose.Types.ObjectId(), companyId: buyer._id },
    };

    const res = {
      status: (code) => ({
        json: (data) => {
          if (code >= 400) console.log(`❌ Erro ${code}:`, data.message);
          return data;
        }
      }),
      json: (data) => {
        escrowId = data.escrowId; // Captura o ID para a próxima fase
        console.log("🚀 [CHECKOUT] Session criada:", data.escrowId);
        return data;
      },
    };

    await createCheckoutSession(req, res);

    if (!escrowId) throw new Error("Falha ao capturar EscrowId do Checkout");

    // 4️⃣ Fase de Confiança (Aprovação Dupla)
    await approveEscrow(escrowId, { companyId: buyer._id });
    await approveEscrow(escrowId, { companyId: seller._id });
    console.log("✅ [APPROVAL] Buyer e Seller assinaram o contrato.");

    // 5️⃣ Liquidação Final (Onde o dinheiro se move)
    // Usamos 'finalAmount' que é o que o teu service retorna
    const releaseResult = await releaseEscrow(escrowId, { companyId: buyer._id });
    console.log(`🎉 [RELEASE] Fee: ${releaseResult.fee} | Net to Seller: ${releaseResult.netAmount} USD`);

    // 6️⃣ Auditoria Final de Saldos
    const fBuyer = await Wallet.findOne({ companyId: buyer._id });
    const fSeller = await Wallet.findOne({ companyId: seller._id });
    const fPlatform = await Wallet.findOne({ isPlatform: true });

    console.log("\n============================================");
    console.log("📊      HUBKON FULL SETTLEMENT REPORT       ");
    console.log("============================================");
    console.log(`✅ Buyer Wallet:  ${fBuyer.balance} (Locked: ${fBuyer.locked})`);
    console.log(`✅ Seller Wallet: ${fSeller.balance}`);
    console.log(`🏦 HUBKON PROFIT: ${fPlatform.balance} (Ford Raptor Fund 🏎️)`);
    console.log("============================================\n");

    await mongoose.disconnect();
    console.log("🔌 Ciclo finalizado com 100% de sucesso.");

  } catch (err) {
    console.error("❌ Teste abortado:", err.message);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(1);
  }
};

runTest();
