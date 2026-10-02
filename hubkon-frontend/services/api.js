import axios from "axios";
// ✅ INJEÇÃO DA SPRINT 5 (FRONTEND): Importa a biblioteca para cálculo do hash HMAC
import CryptoJS from "crypto-js";

const api = axios.create({
  // ✅ Padrão HUBKON Master Engine
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 15000, // 🛡️ Timeout de 15s para evitar requisições penduradas
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 🛡️ INTERCEPTOR DE REQUISIÇÃO
 * Injeta credenciais de segurança e calcula assinaturas criptográficas AppSec.
 */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("@Hubkon:token");
    const apiKey = localStorage.getItem("@Hubkon:apiKey");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
    }

    // =========================================================================
    // 🛡️ ARMADURA CRIPTOGRÁFICA AUTOMÁTICA (HMAC-SHA256 CLIENT SHIELD ALINHADA)
    // =========================================================================
    // MODIFICAÇÃO DE ELITE: Alinhado com o construtor cego real (/build-unsigned-tx) chamado na interface
    if (config.url?.includes("/orchestration/build-unsigned-tx") && config.method === "post" && config.data) {
      try {
        // Lemos a chave secreta master configurada no teu .env do Next.js
        // Fallback idêntico ao do backend para garantir paridade total em desenvolvimento local
        const secretKey = process.env.NEXT_PUBLIC_HMAC_SECRET || "HUBKON_SUPER_SECRET_COMPLIANCE_KEY_2026";
        
        // Convertemos os dados da fatura exatamente na mesma string estável e linear
        const payloadString = typeof config.data === "string" ? config.data : JSON.stringify(config.data);
        
        // Calculamos o hash SHA256 criptográfico localmente
        const hash = CryptoJS.HmacSHA256(payloadString, secretKey);
        const computedSignature = hash.toString(CryptoJS.enc.Hex).toLowerCase();
        
        // Injeta a assinatura de integridade legítima no Header da requisição
        config.headers["x-hubkon-signature"] = computedSignature;
        
        console.log("📡 [APPSEC FRONTEND] Assinatura de integridade gerada e anexada:", computedSignature);
      } catch (cryptoError) {
        console.error("🚨 [APPSEC FRONTEND] Falha ao calcular assinatura HMAC do lado do cliente:", cryptoError.message);
      }
    }
    // =========================================================================
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * 🚨 INTERCEPTOR DE RESPOSTA
 * Gestão de Erros de Sessão e Falhas de Conectividade.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Tratamento de Erros de Autorização (Token Inválido/Expirado)
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.includes("/login")) {
        console.warn("🛡️ Sessão Soberana Expirada. Reiniciando Terminal...");
        localStorage.removeItem("@Hubkon:token");
        localStorage.removeItem("@Hubkon:user");
        window.location.href = "/login";
      }
    }

    // 2. Tratamento de Erros de Conectividade (Backend Offline)
    if (!error.response) {
      console.error("🔥 Master Engine Offline ou Erro de Rede.");
    }

    return Promise.reject(error);
  }
);

export default api;
