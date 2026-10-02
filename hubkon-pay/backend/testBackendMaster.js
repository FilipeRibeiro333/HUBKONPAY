import axios from "axios";
import mongoose from "mongoose";

// Configurações locais de Sandbox do teu ecossistema
const API_URL = "http://localhost:5000/api/orchestration";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hubkon_db";

async function runMasterBackendTest() {
  console.log("==================================================");
  console.log("📡 AUDITORIA GERAL END-TO-END: PIPELINE BACKEND HUBKON");
  console.log("==================================================\n");

  try {
    // -----------------------------------------------------------------
    // AUDITORIA 1: Testar o Servidor Central (app.js Gateway Check)
    // -----------------------------------------------------------------
    console.log("⏳ Testando conectividade com o Gateway Central...");
    const healthCheck = await axios.get("http://localhost:5000/health");
    console.log(`✅ [GATEWAY STATUS]: ${healthCheck.data.status}\n`);

    // -----------------------------------------------------------------
    // AUDITORIA 2: Testar o Montador Cego (/build-unsigned-tx)
    // -----------------------------------------------------------------
    console.log("⏳ Requisitando montagem de bytes desarmados (Engine 2)...");
    const payloadBuild = {
      clientPublicKey: "7V3h6U4nQy98HwE12XJkLpM5nR4qStVuWxYz2m7K8wWq",
      destinationWallet: "3nL5m2P7Qn85HwE12XJkLpM5nR4qStVuWxYz2m7K8wWq",
      amount: 10000,
      assetType: "USDC"
    };

    const buildResponse = await axios.post(`${API_URL}/build-unsigned-tx`, payloadBuild);
    
    console.log("✅ [MONTADOR SUCESSO]: Bytes brutos gerados sem custódia!");
    console.log(`  - Taxa Hubkon Retida (1%): $${buildResponse.data.feeApplied} USDC`);
    console.log(`  - Valor Líquido Final: $${buildResponse.data.netAmount} USDC`);
    console.log(`  - Unsigned Hex Payload: ${buildResponse.data.unsignedTxHex.slice(0, 40)}...\n`);

    // -----------------------------------------------------------------
    // AUDITORIA 3: Testar Transmissão Cega & Escrita Mongoose (/broadcast)
    // -----------------------------------------------------------------
    console.log("📡 Simulando assinatura no Frontend e disparando /broadcast...");
    const payloadBroadcast = {
      signedTxHex: buildResponse.data.unsignedTxHex, // Simula a devolução dos bytes assinados
      companyId: "64f1a2b3c4d5e6f7a8b9c0d1",
      initialAmount: 10000,
      assetType: "USDC",
      invoiceNumber: `INV-MASTER-TEST-${Date.now()}`
    };

    const broadcastResponse = await axios.post(`${API_URL}/broadcast`, payloadBroadcast);
    
    console.log("✅ [BROADCAST SUCESSO]: Transação gravada com sucesso!");
    console.log(`  - Hash Blockchain Gerado: ${broadcastResponse.data.blockchainSignature}`);
    console.log(`  - Estado de Escrita no MongoDB Ledger: ${broadcastResponse.data.payload.status}`);
    console.log(`  - Identificador do Schema Mongoose: ${broadcastResponse.data.payload.type}`);

  } catch (error) {
    console.error("\n❌ [CRITICAL BACKEND ERROR]: A rota falhou ou o servidor está offline.");
    if (error.response) {
      console.error(`  - Status HTTP do Erro: ${error.response.status}`);
      console.error(`  - Mensagem do Servidor:`, error.response.data);
    } else {
      console.error(`  - Detalhes: ${error.message}`);
      console.error("  💡 NOTA: Garante que ligaste o teu servidor principal (npm run dev / node server.js) antes de rodar este teste!");
    }
  } finally {
    console.log("\n==================================================");
    console.log("🏁 FIM DA MARATONA DE AUDITORIA DO BACKEND");
    console.log("==================================================");
  }
}

runMasterBackendTest();
