import fetch from "node-fetch";

const API = "http://localhost:5000/api";

async function runTest() {
  try {

    // 1️⃣ LOGIN
    const loginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "superadmin@hubkon.com",
        password: "12345678"
      })
    });

    const loginData = await loginRes.json();

    if (!loginData.token) {
      console.log("❌ Falha no login:", loginData);
      return;
    }

    console.log("✅ Login bem-sucedido! Token obtido.");

    const token = loginData.token;

    console.log("🔑 Token:", token);

    // 2️⃣ CRIAR EMPRESA
    const companyRes = await fetch(`${API}/company`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: "Empresa Teste HUBKON",
        email: "empresa" + Date.now() + "@teste.com"
      })
    });

    const companyData = await companyRes.json();

    console.log("🏢 Empresa criada:", companyData);

    // 3️⃣ LISTAR EMPRESAS
    const listRes = await fetch(`${API}/company`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const listData = await listRes.json();

    console.log("📃 Lista de empresas:", listData);

  } catch (err) {
    console.error("❌ Erro no teste:", err.message);
  }
}

runTest();