// tests/testCheckoutSession.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Company from "../src/models/companyModel.js";
import Wallet from "../src/models/walletModel.js";
import { createEscrow } from "../src/services/escrowService.js";

// Helper para simular req/res
const mockReqRes = (user, body = {}) => {
  return [
    { user, body, params: body.params || {} },
    { json: (output) => { console.log("\n🚀 Checkout Session Result:", output); return output; }, 
      status: function(code){ this.code = code; return this; } }
  ];
};

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado para teste de checkout");

    // Limpar DB
    await Company.deleteMany({});
    await Wallet.deleteMany({});

    // Criar empresas
    const companyA = await Company.create({ name: "Buyer Corp", email: "buyer@hubkon.com" });
    const companyB = await Company.create({ name: "Seller Ltd", email: "seller@hubkon.com" });

    // Inicializar wallets
    const walletA = await Wallet.create({ companyId: companyA._id, balance: 1000 });
    const walletB = await Wallet.create({ companyId: companyB._id, balance: 500 });
    const platform = await Wallet.create({ isPlatform: true, balance: 0 });

    console.log(`💰 Saldo Inicial - A: ${walletA.balance} | B: ${walletB.balance}`);

    // Mock do usuário comprador
    const user = { 
      userId: new mongoose.Types.ObjectId(),  // ObjectId válido
      companyId: companyA._id 
    };

    // Simular criação de sessão de checkout
    const [req, res] = mockReqRes(user, {
      amount: 100,
      currency: "USD",
      companyB: companyB._id
    });

    // --- CRIAR ESCROW ---
    try {
      const escrow = await createEscrow({
        companyA: user.companyId,
        companyB: req.body.companyB,
        amount: req.body.amount,
        currency: req.body.currency,
        createdBy: user.userId
      });

      res.json({
        success: true,
        message: "Checkout session criada com sucesso",
        escrowId: escrow._id,
        amount: escrow.amount,
        currency: escrow.currency,
        fee: escrow.feeApplied || 2, // simular fee 2%
        netAmount: escrow.amount - (escrow.feeApplied || 2)
      });

    } catch (err) {
      res.json({
        success: false,
        message: `Escrow validation failed: ${err.message}`
      });
    }

    await mongoose.disconnect();
    console.log("🔌 Teste finalizado com sucesso.");

  } catch (err) {
    console.error("❌ Teste falhou:", err.message);
    process.exit(1);
  }
};

runTest();