require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const axios = require('axios');
const { clearBlockchain, createGenesisBlock, addBlock, validateChain } = require('./src/blockchain/blockchain');

async function runTests() {
  try {
    // -------------------- Conecta MongoDB --------------------
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado no teste!');

    // -------------------- Limpa blockchain --------------------
    await clearBlockchain();

    // -------------------- Cria usuário de teste --------------------
    const userEmail = `teste_${Date.now()}@hubkon.com`;
    const userResponse = await axios.post('http://localhost:5000/api/users', {
      nome: 'Usuário Teste',
      email: userEmail,
      senha: 'SenhaForte123'
    });
    console.log('👤 Usuário criado:', userResponse.data);

    // -------------------- Login --------------------
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: userEmail,
      senha: 'SenhaForte123'
    });
    const token = loginResponse.data.accessToken;
    console.log('🔐 Login realizado, token obtido');

    // -------------------- Teste crypto-payment --------------------
    const cryptoTest = await axios.post('http://localhost:5000/api/crypto-payment/test', {
      email: userEmail,
      senha: 'SenhaForte123',
      amount: 100,
      currency: 'USD'
    });
    console.log('💰 Crypto-payment teste:', cryptoTest.data);

    // -------------------- Blockchain --------------------
    const genesis = await createGenesisBlock();
    console.log('⛓️ Blockchain iniciada:', { message: 'Genesis block criado', genesis });

    const block = await addBlock([{ from: 'Alice', to: 'Bob', amount: 50 }]);
    console.log('⛏️ Bloco minerado:', block);

    const validation = await validateChain();
    console.log('🔍 Blockchain validada:', validation);

    console.log('🎯 Todos os testes executados com sucesso!');

  } catch (err) {
    console.error('❌ Erro geral nos testes:', err.response?.data || err.message);
  }
}

runTests();