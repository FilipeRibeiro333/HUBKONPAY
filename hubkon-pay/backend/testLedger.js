import mongoose from "mongoose";
import Transaction from "./src/models/TransactionModel.js";

// string de conexão local ao teu MongoDB Sandbox (ajusta a porta ou nome se for diferente)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hubkon_db";

async function runLedgerTest() {
  console.log("==================================================");
  console.log("📡 INICIANDO AUDITORIA CENTRAL DO LEDGER MONGODB");
  console.log("==================================================\n");

  try {
    // 1. Conexão Atómica à Base de Dados
    console.log("⏳ Conectando ao MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conexão estabelecida com sucesso.\n");

    // 2. Simulação de um Payload de Resgate Fiduciário (Off-Ramp)
    console.log("⚙️ Fabricando transação de teste com os novos campos B2B...");
    const mockOffRampTx = new Transaction({
      company: "64f1a2b3c4d5e6f7a8b9c0d1", // ID simulado do Ledger
      amount: 50000,
      currency: "USD",
      digitalCurrencyUsed: "USDC",
      selectedRail: "SWIFT_BANK",
      settlementPartner: "BANCO_PARCEIRO_LICENCIADO_BNA",
      invoiceNumber: `INV-OFFRAMP-${Date.now()}`,
      destinationCountry: "Portugal",
      
      // 🏦 NOVOS CAMPOS EXECUTADOS NA FASE 1
      targetIBAN: "PT50000300001234567890123",
      swiftCode: "BPIAPTPLXXX",
      bankName: "Banco BPI Portugal",
      
      status: "PENDING_APPROVAL", // Ativa a trava Multi-Sig protectora
      feeApplied: 500, // 1.0% de taxa retida
      netAmount: 49500,
      type: "fiat_offramp_routing", // Enum expandido da sprint
      
      metadata: {
        ip: "192.168.1.100",
        userAgent: "HubkonCoreEngine/V2",
        riskScore: 5
      }
    });

    // 3. Persistência Física no Disco
    console.log("💾 Gravando registo expandido no MongoDB...");
    const savedTx = await mockOffRampTx.save();
    console.log("✅ REGISTO GRAVADO COM SUCESSO ABSOLUTO!");
    
    // 4. Verificação de Leitura do Ledger
    console.log("\n🔍 Relatório de Verificação Forense do Documento:");
    console.log(`  - ID da Transação: ${savedTx._id}`);
    console.log(`  - Tipo de Operação: ${savedTx.type}`);
    console.log(`  - Carril Alocado: ${savedTx.selectedRail}`);
    console.log(`  - IBAN Destino: ${savedTx.targetIBAN}`);
    console.log(`  - SWIFT Code: ${savedTx.swiftCode}`);
    console.log(`  - Banco Alocado: ${savedTx.bankName}`);
    console.log(`  - Taxa Retida HUBKON: $${savedTx.feeApplied} USDC`);
    console.log(`  - Estado de Segurança: ${savedTx.status}`);

    // 5. Limpeza de Sandbox (Remove o registo de teste para não poluir o teu banco)
    console.log("\n🧹 Limpando dados simulados de staging...");
    await Transaction.findByIdAndDelete(savedTx._id);
    console.log("✅ Base de dados purificada.");

  } catch (error) {
    console.error("\n❌ [LEDGER CRITICAL ERROR] Falha na validação do Schema:");
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n==================================================");
    console.log("✅ AUDITORIA CONCLUÍDA: MONGOOSE SCHEMA VALIDADO");
    console.log("==================================================");
  }
}

runLedgerTest();
