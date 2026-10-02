import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE = 'http://localhost:5000';

const login = async (email, password) => {
  const res = await axios.post(`${BASE}/api/auth/login`, { email, password });
  return res.data.token;
};

const test = async () => {
  console.log('🔹 Teste completo de roles\n');

  const users = [
    { email: 'superadmin@hubkon.com', password: '123456', role: 'superadmin' },
    { email: 'admin@hubkon.com', password: '123456', role: 'admin' },
    { email: 'user1@hubkon.com', password: '123456', role: 'user' }
  ];

  for (const u of users) {
    console.log(`👤 Testando ${u.role}:`);

    try {
      const token = await login(u.email, u.password);
      console.log(`✅ Login sucesso: ${u.email}`);

      // Teste dashboard
      try {
        const res = await axios.get(
          `${BASE}/api/admin/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✅ Dashboard:`, res.data);
      } catch (err) {
        console.log(`⛔ Dashboard:`, err.response?.data?.message || err.message);
      }

      // Teste blockchain
      try {
        const res = await axios.get(
          `${BASE}/api/blockchain`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✅ Blockchain:`, res.data);
      } catch (err) {
        console.log(`⛔ Blockchain:`, err.response?.data?.message || err.message);
      }

    } catch (err) {
      console.log(`❌ Erro no login:`, err.response?.data?.message || err.message);
    }

    console.log('');
  }

  console.log('🎉 Testes finalizados');
};

test();