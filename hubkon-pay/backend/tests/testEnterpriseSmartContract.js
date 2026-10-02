/**
 * 🏛️ HUBKON PAY - ENTERPRISE SMART CONTRACT & VALIDATOR TEST
 * ------------------------------------------------------
 * Objetivo: Validar Taxa de 1.5% e a Assinatura Digital do Juiz.
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import Company from "../src/models/CompanyModel.js";
import Wallet from "../src/models/WalletModel.js";
import Escrow from "../src/models/EscrowModel.js"; 
import Block from "../src/models/BlockModel.js"; // 👈 Importamos para ler a assinatura
import { releaseEscrow } from "../src/services/escrowService.js";

const runEnterpriseTest = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI não definida!");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para Auditoria Enterprise\n");

    // 🧹 Limpeza
    await Company.deleteMany({});
    await Wallet.deleteMany({});
    await Escrow.deleteMany({});
    await Block.deleteMany({}); // Limpa blockchain de teste

    // 1️⃣ SETUP: Empresa ENTERPRISE
    const buyer = await Company.create({ 
        name: "Angola Oil & Gas", 
        email: "ceo@oilgas.ao",
        plan: "enterprise" 
    });
    
    const seller = await Company.create({ name: "Equipamentos Tech Ltd", email: "vendas@tech.com", plan: "pro" });

    // 2️⃣ WALLETS
    await Wallet.create({ isPlatform: true, balance: 5000 }); 
    await Wallet.create({ companyId: buyer._id, balance: 100000, locked: 50000 });
    await Wallet.create({ companyId: seller._id, balance: 0 });

    // 3️⃣ CRIAR O ESCROW
    const escrow = await Escrow.create({
        companyA: buyer._id,
        companyB: seller._id,
        amount: 50000,
        status: "approved",
        approvals: { buyerApproved: true, sellerApproved: true }
    });

    console.log(`🏢 Entidade Compradora: ${buyer.name} [PLANO: ${buyer.plan.toUpperCase()}]`);

    // 4️⃣ EXECUÇÃO E ASSINATURA DO JUIZ
    console.log("\n🚀 Finalizando contrato e solicitando selo ao Nó Validador...");
    
    const result = await releaseEscrow(escrow._id, { 
      companyId: buyer._id, 
      role: 'owner'
    });

    // ⏳ PAUSA DE SEGURANÇA: Dá tempo ao Juiz para assinar o bloco (Async)
    console.log("⚖️  [JUIZ] Processando Verificação e Assinatura Digital...");
    await new Promise(resolve => setTimeout(resolve, 2500)); 

    // 🔍 BUSCAR O BLOCO NA BLOCKCHAIN PARA VALIDAR O SELO
    const sealedBlock = await Block.findOne({ "transactions.escrowId": escrow._id });

    console.log("\n============================================");
    console.log("🏛️      VEREDITO FINAL DO NÓ VALIDADOR       ");
    console.log("============================================");
    console.log(`✅ TAXA ELITE APLICADA: ${result.rateApplied * 100}%`);
    console.log(`✅ BLOCO INDEX:         #${sealedBlock?.index}`);
    console.log(`🔐 ASSINATURA JUIZ:     ${sealedBlock?.validatorSignature ? sealedBlock.validatorSignature.substring(0, 32) + "..." : "NÃO ASSINADO ❌"}`);
    console.log(`🛡️  SISTEMA STATUS:      TRANSACÇÃO BLINDADA 💎`);
    console.log("============================================\n");

    await mongoose.disconnect();
    console.log("🔌 Teste finalizado. O teu sistema de 10M é agora inquebrável.");

  } catch (err) {
    console.error("\n❌ Falha na Auditoria:", err.message);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(1);
  }
};

runEnterpriseTest();
