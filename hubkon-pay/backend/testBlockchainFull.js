// testBlockchainFull.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");

// -------------------- CONFIGURAÇÃO --------------------
const MONGO_URI = "mongodb://127.0.0.1:27017/hubkon-pay";
const BASE_URL = "http://localhost:5000/api";

const users = [
  {
    nome: "Admin Teste",
    email: "admin@hubkon.io",
    senha: "12345678",
    role: "admin"
  },
  {
    nome: "User Normal",
    email: "user@hubkon.io",
    senha: "12345678",
    role: "user"
  }
];

let jwtToken = '';

// -------------------- FUNÇÃO DE SEED --------------------
async function seedUsers() {
  const User = require("./src/models/userModel");
  await mongoose.connect(MONGO_URI);

  try {
    await User.deleteMany({}); // limpa usuários antigos
    const usersWithHash = users.map(u => ({
      ...u,
      senha: bcrypt.hashSync(u.senha, 10)
    }));
    await User.insertMany(usersWithHash);
    console.log("✅ Usuários de teste criados com sucesso:");
    users.forEach(u => console.log(`- ${u.email} | senha: ${u.senha} | role: ${u.role}`));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

// -------------------- FUNÇÃO DE LOGIN --------------------
async function login(email, senha) {
  try {
    console.log("🔐 Fazendo login...");
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, senha });
    jwtToken = response.data.token;
    console.log("✅ Login realizado, token obtido!");
  } catch (err) {
    console.error("❌ Erro no login:", err.response?.data || err.message);
    process.exit(1);
  }
}

// -------------------- FUNÇÕES BLOCKCHAIN --------------------
async function initBlockchain() {
  try {
    console.log("🚀 Inicializando blockchain...");
    const res = await axios.post(`${BASE_URL}/blockchain/init`, {}, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    console.log("✅ Blockchain inicializada:", res.data);
  } catch (err) {
    console.error("❌ Erro ao inicializar blockchain:", err.response?.data || err.message);
  }
}

async function mineBlock() {
  try {
    console.log("⛏️ Minerando bloco de teste...");
    const transactions = [
      { from: "walletA_publicKey", to: "walletB_publicKey", amount: 10, token: "HUB" },
      { from: "walletB_publicKey", to: "walletC_publicKey", amount: 5, token: "HUB" }
    ];
    const res = await axios.post(`${BASE_URL}/blockchain/mine`, { transactions }, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    console.log("✅ Bloco minerado:", res.data);
  } catch (err) {
    console.error("❌ Erro ao minerar bloco:", err.response?.data || err.message);
  }
}

async function validateChain() {
  try {
    console.log("🔍 Validando blockchain...");
    const res = await axios.get(`${BASE_URL}/blockchain/validate`, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    console.log("✅ Blockchain válida:", res.data);
  } catch (err) {
    console.error("❌ Erro ao validar blockchain:", err.response?.data || err.message);
  }
}

// -------------------- EXECUÇÃO --------------------
(async () => {
  // 1️⃣ Criar usuários de teste
  await seedUsers();

  // 2️⃣ Login com o admin
  await login("admin@hubkon.io", "12345678");

  // 3️⃣ Testar endpoints da blockchain
  await initBlockchain();
  await mineBlock();
  await validateChain();

  console.log("🎉 Teste completo finalizado com sucesso!");
})();