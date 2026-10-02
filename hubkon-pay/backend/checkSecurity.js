// checkSecurity.js
const axios = require('axios');

const baseURL = 'http://localhost:5000'; // ajuste se seu servidor rodar em outra porta
const origins = [
  'http://localhost:3000',
  'https://meusite.com',
  'https://app.meusite.com'
];

console.log("Iniciando check de segurança 5.2...\n");

(async () => {
  try {
    // ====================
    // 1️⃣ Teste do servidor
    // ====================
    const res = await axios.get(`${baseURL}/health`);
    if (res.status === 200) console.log("Servidor respondeu: 200 ✅");
    else console.log(`Servidor respondeu: ${res.status} ❌`);
  } catch (err) {
    console.error("Servidor não respondeu ❌", err.message);
    return;
  }

  // ====================
  // 2️⃣ Teste Helmet / CSP
  // ====================
  try {
    const res = await axios.get(baseURL);
    const csp = res.headers['content-security-policy'];
    if (csp) console.log("✅ Helmet / CSP configurado");
    else console.log("❌ Helmet / CSP ausente");
  } catch {
    console.log("❌ Helmet / CSP ausente");
  }

  // ====================
  // 3️⃣ Teste X-Powered-By
  // ====================
  try {
    const res = await axios.get(baseURL);
    if (!res.headers['x-powered-by']) console.log("✅ X-Powered-By removido");
    else console.log("❌ X-Powered-By presente");
  } catch {
    console.log("❌ X-Powered-By presente");
  }

  // ====================
  // 4️⃣ Teste Fingerprint Express
  // ====================
  try {
    const res = await axios.get(baseURL);
    if (!res.headers['x-powered-by']) console.log("✅ Fingerprint Express desativado");
    else console.log("❌ Fingerprint Express ainda ativo");
  } catch {
    console.log("❌ Fingerprint Express ainda ativo");
  }

  // ====================
  // 5️⃣ Teste CORS
  // ====================
  for (const origin of origins) {
    try {
      const res = await axios.get(baseURL, { headers: { Origin: origin } });
      const acao = res.headers['access-control-allow-origin'];
      if (acao && acao === origin) console.log(`✅ CORS configurado para ${origin}`);
      else console.log(`❌ CORS não configurado para ${origin}`);
    } catch {
      console.log(`❌ CORS não configurado para ${origin}`);
    }
  }

  // ====================
  // 6️⃣ Teste Rate Limiting
  // ====================
  try {
    let blocked = false;
    for (let i = 0; i < 120; i++) {
      try {
        await axios.get(`${baseURL}/health`);
      } catch (err) {
        if (err.response && err.response.status === 429) {
          blocked = true;
          break;
        }
      }
    }
    if (blocked) console.log("✅ Rate Limiting presente");
    else console.log("❌ Rate Limiting ausente");
  } catch {
    console.log("❌ Rate Limiting ausente");
  }

  // ====================
  // 7️⃣ Teste headers extras
  // ====================
  try {
    const res = await axios.get(baseURL);
    const headers = res.headers;

    console.log(headers['x-frame-options'] ? "✅ Header extra x-frame-options configurado" : "❌ Header extra x-frame-options ausente");
    console.log(headers['x-content-type-options'] ? "✅ Header extra x-content-type-options configurado" : "❌ Header extra x-content-type-options ausente");
    console.log(headers['strict-transport-security'] ? "✅ Header extra strict-transport-security configurado" : "❌ Header extra strict-transport-security ausente");
    console.log(headers['cross-origin-embedder-policy'] ? "✅ Header extra cross-origin-embedder-policy configurado" : "❌ Header extra cross-origin-embedder-policy ausente");
    console.log(headers['cross-origin-opener-policy'] ? "✅ Header extra cross-origin-opener-policy configurado" : "❌ Header extra cross-origin-opener-policy ausente");
    console.log(headers['cross-origin-resource-policy'] ? "✅ Header extra cross-origin-resource-policy configurado" : "❌ Header extra cross-origin-resource-policy ausente");
  } catch {
    console.log("Erro ao checar headers extras");
  }

  console.log("\n🔥 Check final 5.2 concluído!");
})();
