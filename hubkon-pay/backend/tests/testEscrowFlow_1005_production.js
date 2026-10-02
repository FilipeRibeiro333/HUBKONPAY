// tests/testEscrowFlow_1005_production.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import blockchain from "../src/blockchain/blockchain.js"; // singleton correto
import Company from "../src/models/CompanyModel.js";
import Wallet from "../src/models/walletModel.js";
import Escrow from "../src/models/EscrowModel.js";

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado com sucesso");

    // -----------------------------
    // Preparar Companies
    // -----------------------------
    let companyA = await Company.findOne({ email: "companyA@hubkon.com" });
    if (!companyA) {
      companyA = await Company.create({ name: "Company A", email: "companyA@hubkon.com" });
      console.log("✅ Company A criada:", companyA);
    }

    let companyB = await Company.findOne({ email: "companyB@hubkon.com" });
    if (!companyB) {
      companyB = await Company.create({ name: "Company B", email: "companyB@hubkon.com" });
      console.log("✅ Company B criada:", companyB);
    }

    // -----------------------------
    // Preparar Wallets
    // -----------------------------
    let walletA = await Wallet.findOne({ companyId: companyA._id });
    if (!walletA) {
      walletA = await Wallet.create({ companyId: companyA._id, balance: 1000, locked: 0 });
      console.log("✅ Wallet A criada:", walletA);
    }

    let walletB = await Wallet.findOne({ companyId: companyB._id });
    if (!walletB) {
      walletB = await Wallet.create({ companyId: companyB._id, balance: 500, locked: 0 });
      console.log("✅ Wallet B criada:", walletB);
    }

    console.log("✅ Wallets prontas:");
    console.log("Wallet A:", walletA.balance);
    console.log("Wallet B:", walletB.balance);

    // -----------------------------
    // Criar Escrow
    // -----------------------------
    const amount = 200;

    const escrow = await Escrow.create({
      companyA: companyA._id,
      companyB: companyB._id,
      amount,
      approvals: { buyerApproved: false, sellerApproved: false },
      status: "pending",
      conditions: [],
    });
    console.log("✅ Escrow criado:", escrow._id);

    // -----------------------------
    // Simular release do Escrow
    // -----------------------------
    // 1. Deduzir da Wallet A
    walletA.balance -= amount;
    await walletA.save();
    console.log("✅ Saldo atualizado Wallet A:", walletA.balance);

    // 2. Adicionar na Wallet B
    walletB.balance += amount;
    await walletB.save();
    console.log("✅ Saldo atualizado Wallet B:", walletB.balance);

    // 3. Atualizar Escrow status
    escrow.status = "released";
    await escrow.save();
    console.log("✅ Escrow concluído:", escrow.status);

    // -----------------------------
    // Registrar na Blockchain
    // -----------------------------
    // Criar uma transação fictícia para registro imutável
    const tx = {
      from: walletA._id.toString(),
      to: walletB._id.toString(),
      amount,
      timestamp: Date.now(),
      isValid: () => true, // simulação simples
    };

    blockchain.addTransaction(tx);
    blockchain.minePendingTransactions({ name: "Miner1", addBalance: () => {} });

    console.log("✅ Blockchain atualizado com a transação do Escrow");
    console.log("Blockchain:", blockchain.getChain());

    await mongoose.disconnect();
    console.log("MongoDB desconectado, teste de escrow finalizado");
  } catch (err) {
    console.error("❌ Erro no fluxo de escrow production:", err.message);
    await mongoose.disconnect();
  }
}

main();