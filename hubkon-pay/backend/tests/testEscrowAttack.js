/**
 * Test Escrow Attack – Blindado
 * -----------------------------
 * Simula ataques ao escrow:
 * 1️⃣ Double release (cliques duplos)
 * 2️⃣ Oráculo inválido
 * 3️⃣ Wallet inexistente
 *
 * Mostra no terminal que o sistema bloqueia todas as ações não autorizadas.
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
import User from '../src/models/UserModel.js';

async function main() {
  try {
    // -----------------------------
    // 1️⃣ Connect to MongoDB
    // -----------------------------
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for Escrow ATTACK tests');

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
    const hacker = await User.create({ name: "Hacker", email: "hacker@test.com", password: "123456", role: "user" }); // Usuário não autorizado

    // -----------------------------
    // 4️⃣ Create Wallets
    // -----------------------------
    const walletA = await Wallet.create({ userId: userA._id, companyId: companyA._id, balance: 1000 });
    // ⚠️ Wallet de companyB NÃO criada para simular erro
    console.log(`💰 Wallets created: ${walletA.balance} USD for Company A`);

    // -----------------------------
    // 5️⃣ Create Escrow
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
    // 6️⃣ Attempt Fulfill Escrow via Oracle (should fail: wallet missing)
    // -----------------------------
    const fulfillReq1 = {
      body: { escrowId: escrow._id },
      user: { id: oracle._id, role: "fiscal" }
    };

    const fulfillRes1 = {
      statusCode: null,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    await fulfillEscrowCondition(fulfillReq1, fulfillRes1);
    console.log("⚠️ Attempt 1 (wallet missing) Result:", fulfillRes1.data);

    // -----------------------------
    // 7️⃣ Add Wallet for companyB
    // -----------------------------
    const walletB = await Wallet.create({ userId: userB._id, companyId: companyB._id, balance: 0 });
    console.log(`💰 Wallet for Company B created`);

    // -----------------------------
    // 8️⃣ Attempt Fulfill Escrow via Hacker (unauthorized)
    // -----------------------------
    const fulfillReq2 = {
      body: { escrowId: escrow._id },
      user: { id: hacker._id, role: "user" }
    };

    const fulfillRes2 = {
      statusCode: null,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    await fulfillEscrowCondition(fulfillReq2, fulfillRes2);
    console.log("⚠️ Attempt 2 (unauthorized hacker) Result:", fulfillRes2.data);

    // -----------------------------
    // 9️⃣ Fulfill Escrow correctly via Oracle
    // -----------------------------
    const fulfillReq3 = {
      body: { escrowId: escrow._id },
      user: { id: oracle._id, role: "fiscal" }
    };

    const fulfillRes3 = {
      statusCode: null,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    await fulfillEscrowCondition(fulfillReq3, fulfillRes3);
    console.log("✅ Attempt 3 (authorized Oracle) Result:", fulfillRes3.data);

    // -----------------------------
    // 🔟 Attempt Double Release (should fail)
    // -----------------------------
    const fulfillReq4 = {
      body: { escrowId: escrow._id },
      user: { id: oracle._id, role: "fiscal" }
    };

    const fulfillRes4 = {
      statusCode: null,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.data = payload; return this; }
    };

    await fulfillEscrowCondition(fulfillReq4, fulfillRes4);
    console.log("⚠️ Attempt 4 (double release) Result:", fulfillRes4.data);

  } catch (err) {
    console.error("❌ Escrow ATTACK Test Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected after ATTACK test");
  }
}

main();