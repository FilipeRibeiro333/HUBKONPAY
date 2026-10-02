const mongoose = require('mongoose');
const User = require('./src/models/userModel');
require('dotenv').config();

const users = [
  { email: 'admin@hubkon.io', password: '12345678', role: 'admin' },
  { email: 'user@hubkon.io', password: '12345678', role: 'user' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado com sucesso!');

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`Usuário criado: ${u.email} / ${u.password}`);
      } else {
        console.log(`Usuário já existe: ${u.email}`);
      }
    }

    console.log('✅ Seed finalizado');
    process.exit(0);
  } catch (err) {
    console.error('💥 Erro no seed:', err);
    process.exit(1);
  }
}

seed();