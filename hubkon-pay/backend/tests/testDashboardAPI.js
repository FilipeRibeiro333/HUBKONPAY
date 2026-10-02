import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * 📊 TESTE DASHBOARD API (NÍVEL FORD RAPTOR)
 * Este script valida se o Admin consegue ver os lucros em USD e EUR.
 */

const BASE_URL = "http://localhost:5000/api";
const API_KEY = "PLATFORM_KEY_001"; // Garante que esta chave está no teu .env ou DB

const testDashboard = async () => {
  try {
    console.log("🚀 Iniciando Teste de Dashboard Real...");

    // 1️⃣ LOGIN COMO SUPERADMIN
    // Usando as credenciais exatas do teu setupTestEnv.js
    console.log("🔐 Tentando login como Admin...");
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: "admin@hubkon.com",
      password: "Senha123!" // 👈 Sincronizado com o teu setup
    }, { 
      headers: { "x-api-key": API_KEY } 
    });

    const token = loginRes.data.token;
    console.log("✅ Admin autenticado com sucesso!");

    // 2️⃣ CHAMAR A ROTA DE DASHBOARD (A MÃE DOS LUCROS)
    // Esta rota passa pelo authMiddleware e adminMiddleware
    console.log("📊 Solicitando estatísticas de lucro...");
    const statsRes = await axios.get(`${BASE_URL}/admin/dashboard/stats`, {
      headers: { 
        "x-api-key": API_KEY,
        "authorization": `Bearer ${token}` // JWT obrigatório aqui
      }
    });

    // 3️⃣ EXIBIR RESULTADOS (A HORA DA VERDADE)
    console.log("\n💰 --- RELATÓRIO DO DASHBOARD (JSON) ---");
    console.log(JSON.stringify(statsRes.data, null, 2));

    // Validação extra para o teu log
    if (statsRes.data.success) {
      const revenue = statsRes.data.totalRevenue;
      console.log("\n✅ SUCESSO TOTAL!");
      console.log(`💵 Lucro Consolidado (USD): $${revenue?.USD || 0}`);
      console.log(`💶 Lucro Consolidado (EUR): €${revenue?.EUR || 0}`);
      console.log("\n🏎️💨 A Ford Raptor está cada vez mais perto!");
    }

  } catch (err) {
    console.error("\n❌ FALHA NO TESTE DO DASHBOARD:");
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error(`Mensagem:`, err.response.data);
    } else {
      console.error(`Erro: ${err.message}`);
    }
  }
};

testDashboard();
