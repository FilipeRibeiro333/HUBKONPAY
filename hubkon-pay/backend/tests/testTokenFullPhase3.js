import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

// 🔐 SUPER ADMIN FIXO
const SUPERADMIN = {
  id: '69a6bbd092be061a613edb4d',
  email: 'superadmin@hubkon.com',
  password: '12345678'
};

async function login() {
  console.log('🔐 Login...');
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email: SUPERADMIN.email,
    password: SUPERADMIN.password
  });

  console.log('✅ Login realizado');
  return response.data.token;
}

async function mint(token) {
  console.log('🪙 Mint 200...');
  const response = await axios.post(
    `${BASE_URL}/token/mint`,
    {
      userId: SUPERADMIN.id,
      amount: 200
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  console.log('✅ Mint sucesso:', response.data);
}

async function burn(token) {
  console.log('🔥 Burn 50...');
  const response = await axios.post(
    `${BASE_URL}/token/burn`,
    {
      userId: SUPERADMIN.id,
      amount: 50
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  console.log('✅ Burn sucesso:', response.data);
}

async function balance(token) {
  console.log('💰 Consultando saldo...');
  const response = await axios.get(
    `${BASE_URL}/token/balance`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  console.log('💰 Saldo atual:', response.data);
}

async function staking(token) {
  console.log('📈 Iniciando staking 30...');
  const response = await axios.post(
    `${BASE_URL}/token/staking`,
    { amount: 30 },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  console.log('✅ Staking iniciado:', response.data);
}

async function claim(token) {
  console.log('🎁 Claim staking...');
  const response = await axios.post(
    `${BASE_URL}/token/staking/claim`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  console.log('✅ Claim realizado:', response.data);
}

async function run() {
  try {
    const token = await login();

    await mint(token);
    await burn(token);
    await balance(token);
    await staking(token);
    await claim(token);

    console.log('\n🚀 TESTE FASE 3 COMPLETO COM SUCESSO');
  } catch (err) {
    console.error('❌ Erro:', err.response?.data || err.message);
  }
}

run();