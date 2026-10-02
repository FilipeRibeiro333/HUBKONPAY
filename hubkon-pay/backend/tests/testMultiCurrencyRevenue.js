import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Transaction from "../src/models/TransactionModel.js";
import { getPlatformGains } from "../src/services/revenueService.js";

const runMultiCurrencyTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 MongoDB Conectado para Teste Multi-Currency");

    // 1. Limpeza para teste isolado (Não apaga wallets, apenas histórico de lucro)
    await Transaction.deleteMany({ type: "escrow_released" });
    console.log("🧹 Histórico de taxas limpo para o teste");

    // 2. Simular Transações (1 em USD e 1 em EUR)
    // Simulando que o EscrowService já processou e gravou estas taxas
    const mockTransactions = [
      { 
        amount: 1000, feeApplied: 20, currency: "USD", type: "escrow_released",
        from: new mongoose.Types.ObjectId(), to: new mongoose.Types.ObjectId()
      },
      { 
        amount: 500, feeApplied: 10, currency: "EUR", type: "escrow_released",
        from: new mongoose.Types.ObjectId(), to: new mongoose.Types.ObjectId()
      }
    ];

    await Transaction.insertMany(mockTransactions);
    console.log("💸 Transações de 1000$ e 500€ inseridas no Ledger...");

    // 3. Executar o Teu RevenueService
    console.log("📊 Calculando ganhos da plataforma...");
    const report = await getPlatformGains();

    console.log("\n📈 --- RELATÓRIO DE GANHOS (NÍVEL GLOBAL) ---");
    console.log(`🔹 Total de Transações: ${report.count}`);
    console.log(`💵 Lucro em USD: $${report.currencies.USD?.revenue || 0}`);
    console.log(`💶 Lucro em EUR: €${report.currencies.EUR?.revenue || 0}`);

    if (report.currencies.USD?.revenue === 20 && report.currencies.EUR?.revenue === 10) {
        console.log("\n✅ SUCESSO! O motor separou as moedas perfeitamente. 🏎️💨");
    } else {
        console.log("\n❌ Erro no cálculo. Verifica a agregação.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Erro no teste:", err);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
};

runMultiCurrencyTest();
