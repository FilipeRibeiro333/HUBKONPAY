import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5000/api";
const API_KEY = "PLATFORM_KEY_001";

const testMining = async () => {
  try {
    console.log("⛏️ Iniciando Processo de Mineração de Lucros...");

    // 1. Login Admin (Senha123!)
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: "admin@hubkon.com",
      password: "Senha123!"
    }, { headers: { "x-api-key": API_KEY } });

    const headers = { 
      "x-api-key": API_KEY, 
      "authorization": `Bearer ${login.data.token}` 
    };

    // 2. TENTAR MINERAR OS $20 E €10
    console.log("⚙️ Executando Prova de Trabalho (Dificuldade 3)...");
    const mineRes = await axios.post(`${BASE_URL}/admin/blockchain/mine`, {}, { headers });

    console.log("\n💎 --- BLOCO MINERADO COM SUCESSO ---");
    console.log(`📦 Bloco Index: ${mineRes.data.block.index}`);
    console.log(`🔗 Hash: ${mineRes.data.block.hash}`);
    console.log(`🔐 Nonce (Esforço): ${mineRes.data.block.nonce}`);
    console.log(`💰 Transações Seladas: ${mineRes.data.block.transactions.length}`);

    // 3. VERIFICAR NO EXPLORER
    const explorerRes = await axios.get(`${BASE_URL}/admin/blockchain/explorer`, { headers });
    console.log(`\n⛓️ Blocos Totais na Corrente: ${explorerRes.data.chain.length}`);

  } catch (err) {
    console.error("❌ Erro na Mineração:", err.response?.data?.message || err.message);
  }
};

testMining();
