/**
 * Test Escrow Flow PRO – Blindado
 * -------------------------------
 * Simula criação de empresas, usuários, wallets, escrow
 * e fulfillment via Oracle/Administrador.
 *
 * Todos os imports estão padronizados e refletem os nomes reais:
 * UserModel.js, walletModel.js, EscrowModel.js, CompanyModel.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// -----------------------------
// Models & Controllers
// -----------------------------
import { createEscrowController, fulfillEscrowCondition } from '../src/controllers/escrowController.js';
import Escrow from '../src/models/EscrowModel.js';
import Wallet from '../src/models/walletModel.js';
import Company from '../src/models/CompanyModel.js';
import User from '../src/models/UserModel.js'; // ✅ Nome real do arquivo
import blockchain from '../src/utils/blockchain.js';

async function main() {
  try {
    // -----------------------------
    // 1️⃣ Connect to MongoDB
    // -----------------------------
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for Escrow PRO tests');

    // -----------------------------
    // 2️⃣ Clear previous test data
    // -----------------------------
    await Escrow.deleteMany({});
    await Wallet.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Previous test data cleared');

    // -----------------------------
    // 3️⃣ Create Companies & Users
    // -----------------------------
    const companyA = await Company.create({ name: "Company A", email: "a@test.com" });
    const companyB = await Company.create({ name: "Company B", email: "b@test.com" });

    const userA = await User.create({ name: "User A", email: "usera@test.com", password: "123456", role: "admin", companyId: companyA._id });
    const userB = await User.create({ name: "User B", email: "userb@test.com", password: "123456", role: "user", companyId: companyB._id });
    const oracle = await User.create({ name: "Oracle", email: "oracle@test.com", password: "123456", role: "fiscal" });

    console.log('👥 Companies created: Company A & Company B');
    console.log('👤 Users created: User A & User B & Oracle');

    // -----------------------------
    // 4️⃣ Create Wallets
    // -----------------------------
    const walletA = await Wallet.create({ userId: userA._id, companyId: companyA._id, balance: 1000 });
    const walletB = await Wallet.create({ userId: userB._id, companyId: companyB._id, balance: 0 });

    console.log(`💰 Wallets created and funded: ${walletA.balance} USD for Company A`);

    // -----------------------------
    // 5️⃣ Create Escrow (locked)
    // -----------------------------
    const escrowReq = {
      body: {
        companyA: companyA._id,
        companyB: companyB._id,
        amount: 200,
        conditions: { secret: "12345" }
      },
      user: { id: userA._id, role: "admin" }
    };

    const escrowRes = {
      statusCode: null,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    await createEscrowController(escrowReq, escrowRes);
    const escrow = escrowRes.data.escrow;
    console.log(`🔒 Escrow created and funds locked: ${escrow.amount} USD`);

    // -----------------------------
    // 6️⃣ Fulfill Escrow via Oracle
    // -----------------------------
    const fulfillReq = {
      body: { escrowId: escrow._id },
      user: { id: oracle._id, role: "fiscal" }
    };

    const fulfillRes = {
      statusCode: null,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    await fulfillEscrowCondition(fulfillReq, fulfillRes);
    console.log("🔥 Fulfill Escrow Result:", fulfillRes.data);

  } catch (err) {
    console.error("❌ Escrow PRO Test Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected after PRO test");
  }
}

main();