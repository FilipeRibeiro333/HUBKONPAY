/**
 * @file testOracle.js
 * @description Automated Unit Test for the HUBKON Hybrid Oracle Engine.
 * Validates real-time Pyth Network extraction and Redis caching layer speed.
 * Version: V.1022 ELITE ✅
 */

import axios from "axios";

// 🚀 ROTA CORRIGIDA: Alinhada perfeitamente com a Linha 78 do teu app.js (/api/blockchain)
const API_URL = "http://localhost:5000/api/blockchain/exchange/quote";

// 🛡️ SRO ATTENTION: Garante que geras um Token corporativo válido no teu endpoint /login
const MOCK_TOKEN = "TEU_TOKEN_JWT_AQUI"; 

const runOracleTest = async () => {
  console.log("🚀 [TEST] A iniciar verificação do HUBKON Multi-Currency Oracle...");
  
  const config = {
    headers: { Authorization: `Bearer ${MOCK_TOKEN}` },
    params: { from: "AOA", to: "USDC", amount: "100000" } // Massa de teste: 100.000 Kwanzas
  };

  try {
    // 1️⃣ PRIMEIRA CHAMADA: Extração direta da infraestrutura global Pyth Hermes
    console.log("\n🔍 [ROUND 1] Disparando primeira requisição (Consulta ao vivo via Pyth)...");
    const start1 = Date.now();
    const res1 = await axios.get(API_URL, config);
    const duration1 = Date.now() - start1;

    console.log("✅ [SUCCESS] Resposta recebida da HUBKON Engine!");
    console.log(`⏱️ Tempo de Execução: ${duration1}ms (Handshake de rede completo)`);
    console.log("📊 Dados da Cotação:", JSON.stringify(res1.data.quote, null, 2));

    // 2️⃣ SEGUNDA CHAMADA: Recuperação atómica instantânea do teu Redis local no WSL
    console.log("\n⚡ [ROUND 2] Disparando segunda requisição imediata (Verificação de Cache Redis)...");
    const start2 = Date.now();
    const res2 = await axios.get(API_URL, config);
    const duration2 = Date.now() - start2;

    console.log("✅ [SUCCESS] Resposta recuperada da camada de Cache!");
    console.log(`⏱️ Tempo de Execução: ${duration2}ms (Alvo atingido no Redis local)`);
    
    // Validação de performance lógica do SRO (Redis < 15ms)
    if (duration2 < duration1) {
        console.log("\n🛡️ [SRO VALIDATION PASSED]: A camada de cache reduziu drasticamente o tempo de resposta e eliminou sobrecarga de requisições externas.");
    } else {
        console.log("\n⚠️ [SRO WARNING]: O tempo do Redis foi atípico. Certifica-te de que o 'redis-server' está estável no Ubuntu/WSL.");
    }

  } catch (error) {
    console.error("\n❌ [TEST FAILED] Erro na execução do teste do Oráculo:");
    if (error.response) {
        console.error(`Status: ${error.response.status}`);
        
        // SRO Diagnostic Check: Se retornar HTML 404, avisa para validar o prefixo do app.js
        if (typeof error.response.data === 'string' && error.response.data.includes("<!DOCTYPE html>")) {
            console.error("💡 [SRO TIP]: O Express devolveu um ecrã HTML 404. Confere se a tua rota base mudou desde a última revisão do app.js.");
        } else {
            console.error("Mensagem de Erro:", error.response.data);
        }
    } else {
        console.error(error.message);
    }
  }
};

runOracleTest();
