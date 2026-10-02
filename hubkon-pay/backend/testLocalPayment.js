// testLocalPayment.js
require('dotenv').config(); // ⚠️ deve ser a primeira linha
const axios = require('axios');
const jwt = require('jsonwebtoken');

// ------------------ CONFIGURAÇÃO ------------------
const BASE_URL = 'http://localhost:5000'; // URL do servidor backend
const LOCAL_PAYMENT_ENDPOINT = '/local-payment';

// ------------------ GERAR TOKEN ------------------
const userId = 'user123'; // ID do usuário de teste
const token = jwt.sign(
  { id: userId },
  process.env.JWT_SECRET, // pega o segredo real do .env
  { expiresIn: '1d' }
);

console.log('Token gerado para teste:\n', token);

// ------------------ DADOS DE PAGAMENTO ------------------
const paymentData = {
  userId: userId,
  amount: 100.00
};

// ------------------ FAZER REQUISIÇÃO ------------------
axios.post(`${BASE_URL}${LOCAL_PAYMENT_ENDPOINT}`, paymentData, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('✅ Pagamento criado com sucesso:');
  console.log(res.data);
})
.catch(err => {
  if (err.response) {
    console.error('❌ Erro do servidor:', err.response.data);
  } else {
    console.error('❌ Erro:', err.message);
  }
});