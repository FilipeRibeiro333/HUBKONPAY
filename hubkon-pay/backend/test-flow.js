import mongoose from 'mongoose';
import Transaction from './src/models/transactionModel.js';
import Company from './src/models/companyModel.js';
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`📡 Conectado ao banco: ${mongoose.connection.name}`);

    const sender = await Company.findOne({ name: /Alpha Logística/i });
    const receiver = await Company.findOne({ name: /Omega Tech/i });

    if (!sender || !receiver) {
      console.log("❌ ERRO: Empresas não encontradas.");
      process.exit(1);
    }

    console.log(`🚀 Iniciando Escrow de $5.000 entre ${sender.name} e ${receiver.name}...`);

    // Tentando com 'platform_fee' que é o que o seu serviço de analytics espera
    const txData = {
      senderCompany: sender._id,
      receiverCompany: receiver._id,
      amount: 5000,
      currency: "USD",
      type: "platform_fee", // 👈 Alterado para bater com o seu analyticsService
      status: "PENDING_APPROVAL", 
      feeApplied: 150, 
      escrowHash: "0x" + Math.random().toString(16).slice(2)
    };

    const tx = await Transaction.create(txData);

    console.log(`✅ SUCESSO! Transação criada: ${tx._id}`);
    console.log(`👉 Verifique a Fila de Custódia no Dashboard Master.`);
    process.exit(0);
  } catch (err) {
    console.error("🚨 Erro de Enum:");
    console.log(err.message);
    process.exit(1);
  }
}

runTest();
