// tests/testBlockchainPhase2.js

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runPhase2Test() {
  try {
    console.log('\n🚀 Iniciando teste completo Fase 2...\n');

    // =========================
    // 1️⃣ LOGIN
    // =========================
    console.log('🔐 Fazendo login como superadmin...');

    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'superadmin@hubkon.com',
      password: '12345678'
    });

    const token = login.data.token;

    console.log('✅ Login realizado com sucesso\n');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    // =========================
    // 2️⃣ ADICIONAR TRANSAÇÃO
    // =========================
    console.log('💸 Criando transação...');

    await axios.post(
      `${BASE_URL}/blockchain/transaction`,
      {
        from: 'walletA',
        to: 'walletB',
        amount: 25
      },
      { headers }
    );

    console.log('✅ Transação adicionada\n');

    // =========================
    // 3️⃣ MINERAR BLOCO
    // =========================
    console.log('⛏ Minerando bloco...');

    const mine = await axios.post(
      `${BASE_URL}/blockchain/mine`,
      {},
      { headers }
    );

    console.log('✅ Bloco minerado');
    console.log('Miner:', mine.data.miner);
    console.log('Hash:', mine.data.block.hash);
    console.log('Nonce:', mine.data.block.nonce);
    console.log('Reward:', mine.data.reward);
    console.log('');

    // =========================
    // 4️⃣ VALIDAR BLOCKCHAIN
    // =========================
    console.log('🔎 Validando blockchain...');

    const validate = await axios.get(
      `${BASE_URL}/blockchain/validate`,
      { headers }
    );

    console.log('Status:', validate.data.message);
    console.log('');

    // =========================
    // 5️⃣ CONSULTAR CHAIN
    // =========================
    console.log('📦 Consultando blockchain completa...');

    const chain = await axios.get(
      `${BASE_URL}/blockchain`,
      { headers }
    );

    console.log('Total de blocos:', chain.data.chain.length);
    console.log('Difficulty:', chain.data.difficulty);
    console.log('Blockchain válida:', chain.data.valid);
    console.log('');

    console.log('🎉 TESTE COMPLETO DA FASE 2 FINALIZADO COM SUCESSO!\n');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

runPhase2Test();