/**
 * @file server.js
 * @description Main Entry Point for HUBKON MASTER ENGINE.
 * Version: V.1025 ELITE ✅ (Semana 7 Dual-Chain Indexer Patch)
 */
import app from "./app.js";
import connectDB from "./src/config/db.js"; // Importando sua nova conexão dinâmica
import { processDailyBilling } from "./src/services/billingService.js";
import IndexerService from "./src/services/indexerService.js"; // 📡 Injetado para monitorização de blocos Web3

const PORT = process.env.PORT || 5000;

/**
 * 🚀 BOOTSTRAP SEQUENCE
 * Garantimos a integridade dos dados antes de abrir o tráfego.
 */
const startServer = async () => {
  try {
    // 1️⃣ DATABASE HANDSHAKE
    // Garante que o banco definido no .env está ativo antes de qualquer lógica.
    await connectDB();

    // 2️⃣ BILLING ENGINE (SaaS Phase 3)
    // Executa auditoria de assinaturas logo após a conexão com o banco.
    console.log("🔍 [BILLING] Synchronizing enterprise subscriptions...");
    try {
      await processDailyBilling();
      console.log("✅ [BILLING] Daily cycle completed successfully.");
    } catch (billingError) {
      // Falha no billing não deve derrubar o servidor, mas deve ser registrada.
      console.error("⚠️ [BILLING WARNING]:", billingError.message);
    }

    // 3️⃣ SERVER BINDING & BACKGROUND WORKERS
    // Só abre a porta 0.0.0.0 após a infraestrutura estar 100% pronta.
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 HUBKON MASTER ENGINE ONLINE`);
      console.log(`📡 Endpoint: http://0.0.0.0:${PORT}`);
      console.log("🛡️  Shields: ACTIVE [Helmet/RateLimit/KillSwitch]");

      // =========================================================================
      // ⚡ INJEÇÃO DA SEMANA 7: TRABALHADOR DE SEGUNDO PLANO DUAL-CHAIN
      // =========================================================================
      // O indexador acorda e monitoriza blocos confirmados na Solana em background
      IndexerService.startBlockIndexer();
      // =========================================================================
    });

  } catch (criticalError) {
    console.error("❌ [SYSTEM CRASH] Failed to initialize Master Engine:", criticalError.message);
    process.exit(1);
  }
};

// Inicializa a sequência de boot
startServer();
