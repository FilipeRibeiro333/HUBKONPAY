import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/userModel.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');

    const existing = await User.findOne({ email: 'superadmin@hubkon.com' });

    if (existing) {
      console.log('⚠️ SuperAdmin já existe');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('12345678', 10);

    await User.create({
      name: 'Super Admin',
      email: 'superadmin@hubkon.com',
      password: hashedPassword,
      role: 'SuperAdmin'
    });

    console.log('🎉 SuperAdmin criado com sucesso');
    process.exit();
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
};

createSuperAdmin();