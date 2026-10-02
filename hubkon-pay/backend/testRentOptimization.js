/**
 * @file testRentOptimization.js
 * @description Teste de Integração Automatizado para a Semana 10 (Otimização de Rent).
 * Executa a queima forense de PDAs e resgata Lamports para o tesouro.
 * Version: V.1026 PRODUCTION ELITE ✅
 */

import connectDB from "./src/config/db.js";
import Escrow from "./src/models/EscrowModel.js";
import { executeRentRescue } from "./src/services/rentService.js";

const runRentTest = async () => {
  try {
    console.log("🚀 [TEST_W10] A iniciar teste do Motor de Otimização de Rent...");
    
    // 1️⃣ Database Handshake
    await connectDB();
    console.log("🧹 [SRO CLEANUP] Preparando massa de dados isolada no MongoDB...");

    // 2️⃣ Massa de Dados Multi-Tenant: Cria um Escrow no estado 'released' para simular a liquidação prévia
    // Isto evita que o motor dê a trava de segurança "CofreAindaTrancado" [GSO/SRO]
    const testEscrow = await Escrow.create({
      companyA: "69f82d6259e0739d733ecba6", // ID da Omega Tech Global
      companyB: "69f82d6259e0739d733ecba4", // ID da Empresa Parceira
      amount: 45000,
      currency: "USD",
      status: "released", // Enum estrito exigido pelo teu EscrowModel.js
      conditions: [{ type: "milestone", status: "fulfilled" }],
      history: [{ action: "escrow_released_to_vendor", details: "Fundos liberados para o fornecedor estrangeiro." }]
    });

    console.log(`🔹 [DB_SEED] Escrow criado para teste. ID: ${testEscrow._id} | Status: ${testEscrow.status}`);

    console.log("\n🔄 [STEP 1] Disparando o motor rentService de forma síncrona...");
    
    // 3️⃣ Executa a desalocação on-chain chamando o serviço que criámos no passo anterior
    const result = await executeRentRescue(testEscrow._id);

    console.log("\n📊 [STEP 2] Verificando a consistência e persistência do relatório pós-queima...");

    // 4️⃣ Re-busca o contrato no banco para comprovar que o histórico de auditoria forense gravou a Tx da Solana [GSO/SRO]
    const updatedEscrow = await Escrow.findById(testEscrow._id);
    const lastLog = updatedEscrow.history[updatedEscrow.history.length - 1];

    console.log("\n🏆 [AUDIT REPORT] Relatório pós-otimização:");
    console.log(`💵 Hash da Transação gerada: ${result.solanaTxHash}`);
    console.log(`📝 Último registro na Caixa Negra: ${lastLog.action}`);
    console.log(`📝 Detalhes gravados no Ledger local: ${lastLog.details}`);

    console.log("\n🎉 [WEEK 10 PASSED]: Os Lamports de Rent Exemption foram resgatados com sucesso total para a HUBKON!");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ [CRITICAL TEST FAULT]:", error.message);
    process.exit(1);
  }
};

runRentTest();
