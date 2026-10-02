// backend/testApi.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './src/models/userModel.js';
import Company from './src/models/companyModel.js';
import Block from './src/models/block.js';

dotenv.config();

// -------------------- Conexão MongoDB --------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // ✅ Mongoose 7+ não precisa de opções
    console.log('✅ MongoDB conectado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao conectar MongoDB:', err);
  }
};

// -------------------- Função de teste --------------------
const runTest = async () => {
  await connectDB();

  try {
    // 🔹 Limpar dados antigos de teste
    await User.deleteMany({ email: /@teste.com$/ });
    await Company.deleteMany({ email: /@teste.com$/ });
    await Block.deleteMany({});
    console.log('🧹 Dados de teste removidos');

    // 🔹 Criar superadmin
    const superadmin = await User.create({
      nome: 'Superadmin Teste',
      email: 'superadmin@teste.com',
      senha: '12345678',
      role: 'superadmin'
    });
    console.log('✅ Superadmin criado:', superadmin._id);

    // 🔹 Criar empresa de teste
    const company = await Company.create({
      name: 'Empresa Teste',
      email: 'empresa@teste.com',
      plan: 'premium',
      owner: superadmin._id
      // ✅ apiKey será gerada automaticamente pelo schema
    });
    console.log('✅ Empresa criada:', company._id, 'com apiKey:', company.apiKey);

    // 🔹 Criar bloco de teste
    const block = await Block.create({
      index: 1,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: 'abc123hash',
      nonce: 0,
      miner: 'Miner1',
      reward: 50
    });
    console.log('✅ Bloco criado:', block._id);

  } catch (err) {
    console.error('💥 Erro nos testes:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔒 Conexão MongoDB fechada');
  }
};

// -------------------- Executa teste --------------------
runTest();