// tests/testFullFlow.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Wallet from "../models/WalletModel.js";
import Escrow from "../models/EscrowModel.js";
import { createEscrow, approveEscrow } from "../services/escrowService.js";
import blockchain from "../utils/blockchain.js";

async function runFullFlow() {
  try {
    // 🔹 Conectar ao Mongo
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado");

    // 🔹 Resetar Wallets e Escrows
    await Wallet.deleteMany({});
    await Escrow.deleteMany({});
    console.log("🧹 Wallets e Escrows limpos");

    // 🔹 Criar Wallets multi-tenant
    const platformWallet = await Wallet.create({ balance: 0, isPlatform: true });
    const companyAWallet = await Wallet.create({ companyId: "COMPANY_A", balance: 1000 });
    const companyBWallet = await Wallet.create({ companyId: "COMPANY_B", balance: 500 });
    console.log("✅ Wallets criadas:", { platformWallet, companyAWallet, companyBWallet });

    // 🔹 Criar Staking para COMPANY_A
    const stakingAmount = 200;
    companyAWallet.balance -= stakingAmount;
    await companyAWallet.save();
    console.log(`✅ COMPANY_A staking ${stakingAmount}, saldo agora: ${companyAWallet.balance}`);

    // 🔹 Criar Escrow COMPANY_A -> COMPANY_B
    const escrow = await createEscrow({
      companyA: "COMPANY_A",
      companyB: "COMPANY_B",
      amount: 300,
      createdBy: "USER_A"
    });
    console.log("✅ Escrow criado:", escrow);

    // 🔹 Aprovar Escrow como BUYER (Company A)
    let updatedEscrow = await approveEscrow(escrow._id, { companyId: "COMPANY_A", userId: "USER_A" });
    console.log("✅ Escrow aprovado pelo BUYER:", updatedEscrow.approvals);

    // 🔹 Aprovar Escrow como SELLER (Company B)
    updatedEscrow = await approveEscrow(escrow._id, { companyId: "COMPANY_B", userId: "USER_B" });
    console.log("✅ Escrow aprovado pelo SELLER e liberado:", updatedEscrow.status);

    // 🔹 Mostrar saldos finais
    const finalCompanyA = await Wallet.findOne({ companyId: "COMPANY_A" });
    const finalCompanyB = await Wallet.findOne({ companyId: "COMPANY_B" });
    const finalPlatform = await Wallet.findOne({ isPlatform: true });
    console.log("💰 Saldos finais:", {
      COMPANY_A: finalCompanyA.balance,
      COMPANY_B: finalCompanyB.balance,
      PLATFORM: finalPlatform.balance
    });

    // 🔹 Mostrar blockchain
    console.log("🧱 Blockchain:", blockchain.getTransactions());

    await mongoose.disconnect();
    console.log("✅ MongoDB desconectado, teste completo finalizado");
  } catch (err) {
    console.error("❌ Erro no teste full flow:", err);
  }
}

runFullFlow();