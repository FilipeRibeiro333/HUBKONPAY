// tests/testAPI_FullSystem.js
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_URL = "http://localhost:5000/api";
const API_KEY = process.env.API_KEY;

// Helper para headers
const getHeaders = (token = null) => ({
  "x-api-key": API_KEY,
  ...(token && { Authorization: `Bearer ${token}` }),
});

// Debug friendly
const debug = (label, data) => {
  console.log(`\n🧠 DEBUG - ${label}`);
  console.log(JSON.stringify(data, null, 2));
};

// Wrapper para requests com logging
const safeRequest = async (label, fn) => {
  try {
    const res = await fn();
    console.log(`✅ ${label}`);
    debug(label + " RESPONSE", res.data);
    return res.data;
  } catch (err) {
    console.log(`❌ ERRO EM: ${label}`);
    if (err.response) {
      debug("STATUS", err.response.status);
      debug("HEADERS", err.response.headers);
      debug("DATA", err.response.data);
    } else {
      debug("ERROR", err.message);
    }
    throw err;
  }
};

const run = async () => {
  try {
    console.log("\n🔹 INICIANDO TESTE COMPLETO COM DEBUG MULTI-TENANT");

    // =========================
    // LOGIN USUÁRIOS
    // =========================
    const loginA = await safeRequest("Login A", () =>
      axios.post(
        `${API_URL}/auth/login`,
        { email: "debugusera@hubkon.com", password: "Senha123!" },
        { headers: getHeaders() }
      )
    );

    const loginB = await safeRequest("Login B", () =>
      axios.post(
        `${API_URL}/auth/login`,
        { email: "debuguserb@hubkon.com", password: "Senha123!" },
        { headers: getHeaders() }
      )
    );

    const loginAdmin = await safeRequest("Login ADMIN", () =>
      axios.post(
        `${API_URL}/auth/login`,
        { email: "admin@hubkon.com", password: "Senha123!" },
        { headers: getHeaders() }
      )
    );

    const tokenA = loginA.token;
    const tokenB = loginB.token;
    const tokenAdmin = loginAdmin.token;

    // =========================
    // CRIAR ESCROW
    // =========================
    console.log("\n--- ESCROW FLOW ---");

    const escrow = await safeRequest("Criar Escrow", () =>
      axios.post(
        `${API_URL}/escrow/create`,
        { amount: 100, companyB: loginB.companyId },
        { headers: getHeaders(tokenA) }
      )
    );

    const escrowId = escrow.escrow._id;
    debug("ESCROW ID", escrowId);

    // =========================
    // APPROVE ESCROW (URL :id)
    // =========================
    await safeRequest("Approve A", () =>
      axios.post(
        `${API_URL}/escrow/approve/${escrowId}`,
        {},
        { headers: getHeaders(tokenA) }
      )
    );

    await safeRequest("Approve B", () =>
      axios.post(
        `${API_URL}/escrow/approve/${escrowId}`,
        {},
        { headers: getHeaders(tokenB) }
      )
    );

    // =========================
    // RELEASE ESCROW (URL :id)
    // =========================
    await safeRequest("Release Escrow", () =>
      axios.post(
        `${API_URL}/escrow/release/${escrowId}`,
        {},
        { headers: getHeaders(tokenA) } // qualquer aprovador pode liberar
      )
    );

    console.log("\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO (MULTI-TENANT)");

  } catch (err) {
    console.log("\n🔥 TESTE INTERROMPIDO POR ERRO");
  }
};

run();