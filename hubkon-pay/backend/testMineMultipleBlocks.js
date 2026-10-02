// testMineMultipleBlocks.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
const SUPER_ADMIN = {
  email: 'superadmin@hubkon.com',
  password: '12345678'
};

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: SUPER_ADMIN.email,
      password: SUPER_ADMIN.password
    });
    console.log('✅ Login realizado');
    return response.data.token; // token JWT retornado pelo backend
  } catch (err) {
    console.error('❌ Erro no login:', err.response?.data || err.message);
    throw err;
  }
}

async function mineBlock(token, minerEmail, reward = 50) {
  try {
    const response = await axios.post(
      `${BASE_URL}/blockchain/mine`,
      { minerEmail, reward },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`🪙 Bloco minerado: index ${response.data.block.index}`);
  } catch (err) {
    console.error('❌ Erro ao minerar bloco:', err.response?.data || err.message);
  }
}

async function main() {
  try {
    const token = await login();

    // Minerar múltiplos blocos
    for (let i = 0; i < 5; i++) {
      await mineBlock(token, SUPER_ADMIN.email, 50);
    }

    console.log('✅ Teste de mineração finalizado');
  } catch (err) {
    console.error('Erro no teste:', err);
  }
}

main();