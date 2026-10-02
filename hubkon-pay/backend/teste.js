const fetch = require('node-fetch'); // se não tiver, rode: npm install node-fetch@2

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  try {
    console.log('➡️ Criando usuário...');
    const createUserRes = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'Teste Node',
        email: 'testeNode@hubkon.com',
        password: 'SenhaForte123!'
      })
    });
    const user = await createUserRes.json();
    console.log('Usuário criado:', user);

    console.log('➡️ Fazendo login...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'testeNode@hubkon.com',
        password: 'SenhaForte123!'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login realizado, token JWT:', loginData.token);

    console.log('➡️ Pegando dados do usuário...');
    const meRes = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    const meData = await meRes.json();
    console.log('Dados do usuário:', meData);

    console.log('➡️ Pagamento local (simulado)...');
    const paymentRes = await fetch(`${BASE_URL}/api/payment/local`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId: user._id, amount: 1000 })
    });
    const paymentData = await paymentRes.json();
    console.log('Pagamento simulado:', paymentData);

    console.log('➡️ Enviando e-mail teste...');
    const emailRes = await fetch(`${BASE_URL}/api/notifications/email`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        to: 'seuemail@dominio.com',
        subject: 'Teste HUBKON Node',
        text: 'Tudo funcionando via script Node!'
      })
    });
    const emailData = await emailRes.json();
    console.log('E-mail enviado:', emailData);

    console.log('✅ Todos os testes concluídos com sucesso!');

  } catch (err) {
    console.error('❌ Erro durante os testes:', err);
  }
}

runTests();
