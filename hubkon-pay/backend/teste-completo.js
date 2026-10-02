require('dotenv').config();
const fetch = require('node-fetch'); // npm install node-fetch@2

const BASE_URL = 'http://localhost:5000';

// Dados de teste
const userNormal = {
  name: 'Usuário Teste',
  email: 'normal@hubkon.com',
  senha: 'SenhaForte123!'
};

const userAdmin = {
  name: 'Admin Teste',
  email: 'admin@hubkon.com',
  senha: 'SenhaAdmin123!',
  role: 'admin'
};

async function runTests() {
  try {
    console.log('============================');
    console.log('✅ TESTES HUBKON - USUÁRIO NORMAL');
    console.log('============================');

    // Criar usuário normal (ignora erro se já existir)
    await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userNormal)
    }).catch(() => {});

    // Login usuário normal
    console.log('➡️ Login usuário normal...');
    const loginNormalRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userNormal.email, senha: userNormal.senha })
    });
    const loginNormalData = await loginNormalRes.json();
    if (!loginNormalData.accessToken) throw new Error('Falha no login usuário normal');
    const tokenNormal = loginNormalData.accessToken;
    console.log('Login realizado, token JWT:', tokenNormal);

    // Dados do usuário normal
    console.log('➡️ Consultando dados do usuário normal...');
    const meRes = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNormal}` }
    });
    const meData = await meRes.json();
    console.log('Dados do usuário normal:', meData);

    // Pagamento local
    console.log('➡️ Pagamento local simulado...');
    const paymentRes = await fetch(`${BASE_URL}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenNormal}` },
      body: JSON.stringify({ userId: meData._id, amount: 1000 })
    });
    const paymentData = await paymentRes.json();
    console.log('Pagamento simulado:', paymentData);

    // Envio de e-mail
    console.log('➡️ Enviando e-mail teste...');
    const emailRes = await fetch(`${BASE_URL}/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenNormal}` },
      body: JSON.stringify({
        to: 'seuemail@dominio.com', // substitua pelo seu e-mail
        subject: 'Teste HUBKON Node - Usuário Normal',
        text: 'Tudo funcionando para usuário normal!'
      })
    });
    const emailData = await emailRes.json();
    console.log('E-mail enviado:', emailData);

    console.log('\n============================');
    console.log('✅ TESTES HUBKON - ADMINISTRADOR');
    console.log('============================');

    // Criar admin (ignora erro se já existir)
    await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAdmin)
    }).catch(() => {});

    // Login usuário admin
    console.log('➡️ Login usuário admin...');
    const loginAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAdmin.email, senha: userAdmin.senha })
    });
    const loginAdminData = await loginAdminRes.json();
    if (!loginAdminData.accessToken) throw new Error('Falha no login admin');
    const tokenAdmin = loginAdminData.accessToken;
    console.log('Login admin realizado, token JWT:', tokenAdmin);

    // Acessar rota admin
    console.log('➡️ Acessando rota admin...');
    const adminRes = await fetch(`${BASE_URL}/api/users/admin`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const adminData = await adminRes.json();
    console.log('Resultado rota admin:', adminData);

    console.log('\n✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
  } catch (err) {
    console.error('❌ Erro durante os testes:', err.message);
  }
}

runTests();
