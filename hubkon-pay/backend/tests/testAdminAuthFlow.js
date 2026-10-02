/**
 * HUBKON PAY - ADMIN AUTH & DASHBOARD TEST (FIXED) 🏛️
 * --------------------------------------------------
 * Agora com a API_KEY correta do teu .env
 */

import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

// Pegamos a chave diretamente do teu .env
const API_KEY = process.env.API_KEY || "PLATFORM_KEY_001";
const API_URL = "http://localhost:5000/api";

const runAdminAuthTest = async () => {
  try {
    console.log("🚀 [AUTH] Tentando login como SuperAdmin...");

    // 1️⃣ FAZER LOGIN (Enviando a API_KEY no header)
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@hubkon.com",
      password: "HubkonAdmin2026!"
    }, {
      headers: { "x-api-key": API_KEY } // 👈 A chave que o teu middleware exige
    });

    const token = loginRes.data.token;
    console.log("✅ [AUTH] Login realizado. Token JWT obtido.");

    // 2️⃣ ACEDER AO DASHBOARD (Com Dupla Blindagem: JWT + API_KEY)
    console.log("\n📡 [DASHBOARD] Solicitando relatório de lucros...");
    
    const dashboardRes = await axios.get(`${API_URL}/admin/dashboard/stats`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-api-key": API_KEY // 👈 O sistema exige as duas!
      }
    });

    const { revenue, network, treasury } = dashboardRes.data.data;

    console.log("\n============================================");
    console.log("🏛️      HUBKON ADMIN ACCESS GRANTED        ");
    console.log("============================================");
    console.log(`👤 Comandante:  ${loginRes.data.user.name}`);
    console.log(`💸 Lucro USD:   $${revenue[0]?.totalProfit.toFixed(2) || "0.00"}`);
    console.log(`🛡️  Health:      ${network.healthScore}`);
    console.log(`🏦 Tesouraria:  $${treasury.platformBalance.toFixed(2)}`);
    console.log("============================================\n");

    console.log("🔌 Teste finalizado. O teu acesso de luxo está validado!");

  } catch (err) {
    // Log detalhado para sabermos se o erro é 401 (Auth) ou 403 (API Key)
    console.error("❌ [ERRO]:", err.response?.data?.message || err.message);
    process.exit(1);
  }
};

runAdminAuthTest();
