import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Dados do Super Admin
const TEST_USER_ID = '69a6bbd092be061a613edb4d';
const TEST_USER_EMAIL = 'superadmin@hubkon.com';
const TEST_USER_PASSWORD = '12345678';

const BASE_URL = 'http://localhost:5000/api';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    console.log('✅ Login realizado com sucesso');
    return response.data.token; // assumindo que o login retorna { token: '...' }
  } catch (err) {
    console.error('Erro ao logar:', err.response?.data || err.message);
    throw err;
  }
}

async function mintToken(token) {
  try {
    const response = await axios.post(
      `${BASE_URL}/token/mint`,
      {
        userId: TEST_USER_ID,
        amount: 100
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Mint realizado:', response.data);
  } catch (err) {
    console.error('Erro no mint:', err.response?.data || err.message);
  }
}

async function runTests() {
  try {
    const token = await login();
    await mintToken(token);
  } catch (err) {
    console.error('Erro no teste:', err.message);
  }
}

runTests();