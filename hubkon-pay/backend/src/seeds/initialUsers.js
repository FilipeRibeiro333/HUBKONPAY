import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../models/UserModel.js'; // caminho corrigido

dotenv.config();

const users = [
  { name: 'Super Admin', email: 'superadmin@hubkon.com', password: '12345678', role: 'superadmin' },
  { name: 'Admin', email: 'admin@hubkon.com', password: '12345678', role: 'admin' },
  { name: 'User', email: 'user1@hubkon.com', password: '12345678', role: 'user' }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado para seed');

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`ℹ️ Já existe: ${u.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.create({ name: u.name, email: u.email, password: hashedPassword, role: u.role });
      console.log(`👤 Criado: ${u.email}`);
    }

    console.log('🎉 Seed finalizado com sucesso');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err.message);
    process.exit(1);
  }
};

seedUsers();