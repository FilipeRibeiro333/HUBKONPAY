import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Wallet from "../src/models/WalletModel.js";
import Company from "../src/models/CompanyModel.js";
import Escrow from "../src/models/EscrowModel.js";
import { createEscrow, approveEscrow, releaseEscrow } from "../src/services/escrowService.js";

const runAuditTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado para teste de Auditoria");

    // 1️⃣ LIMPEZA RADICAL (Evita o erro E11000 de duplicados)
    await Wallet.deleteMany({});
    await Company.deleteMany({});
    await Escrow.deleteMany({});
    console.log("🗑️  Ambiente limpo para auditoria");

    // 2️⃣ SETUP: Criar Empresas e Wallets
    const buyer = await Company.create({ name: "Buyer Corp", email: "buyer@test.com" });
    const seller = await Company.create({ name: "Seller Ltd", email: "seller@test.com" });

    // Platform Wallet com ID único para não dar conflito com 'null'
    await Wallet.create({ isPlatform: true, balance: 0, companyId: new mongoose.Types.ObjectId() });
    await Wallet.create({ companyId: buyer._id, balance: 1000 });
    await Wallet.create({ companyId: seller._id, balance: 0 });

    // 3️⃣ CRIAR ESCROW
    const escrow = await createEscrow({ 
      companyA: buyer._id, 
      companyB: seller._id, 
      amount: 100 
    });
    console.log("✅ Escrow criado");

    // 4️⃣ TESTAR LOGS DE APROVAÇÃO (History)
    // Simulamos IDs de utilizadores reais para o log
    const userA = new mongoose.Types.ObjectId();
    const userB = new mongoose.Types.ObjectId();

    await approveEscrow(escrow._id, { companyId: buyer._id, _id: userA });
    await approveEscrow(escrow._id, { companyId: seller._id, _id: userB });
    
    // 5️⃣ TESTE DE SEGURANÇA: Seller tenta dar Release (Deve Falhar!)
    console.log("\n🛑 TESTE DE SEGURANÇA: Seller a tentar libertar fundos...");
    try {
      await releaseEscrow(escrow._id, { companyId: seller._id, role: 'user' });
    } catch (err) {
      console.log(`✅ BLOQUEADO: ${err.message}`); 
    }

    // 6️⃣ RELEASE LEGÍTIMO (Pelo Buyer)
    console.log("\n🚀 Buyer a libertar fundos legítimos...");
    const releaseRes = await releaseEscrow(escrow._id, { companyId: buyer._id });

    // 7️⃣ VERIFICAÇÃO FINAL DO HISTÓRICO (O que o Admin vê)
    const finalEscrow = await Escrow.findById(escrow._id);
    console.log("\n📊 --- HISTÓRICO DE AUDITORIA (DATABASE) ---");
    finalEscrow.history.forEach((h, i) => {
        console.log(`${i+1}. [${h.action}] - User: ${h.user || 'SISTEMA'} | Data: ${h.timestamp.toLocaleTimeString()}`);
    });

    console.log(`\n🏦 Ganho Plataforma: ${releaseRes.fee} USD`);
    
    await mongoose.disconnect();
    console.log("\n✅ Teste de Auditoria finalizado com sucesso!");

  } catch (err) {
    console.error("❌ Erro no teste:", err.message);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(1);
  }
};

runAuditTest();
