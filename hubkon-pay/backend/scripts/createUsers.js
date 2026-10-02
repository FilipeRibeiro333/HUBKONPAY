/**
 * @file seedUsers.js
 * @description Database seeding script for HUBKON PAY.
 * Pre-populates the B2B system with administrative and operational roles.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/userModel.js';

dotenv.config();

const users = [
  {
    name: 'Admin Principal',
    email: 'admin@hubkon.com',
    password: '12345678',
    role: 'admin',
    // IMPORTANTE: Adicione uma wallet de teste aqui para o seu vídeo de demo
    walletAddress: '0xYourAdminWalletAddress' 
  },
  {
    name: 'User Teste',
    email: 'user1@hubkon.com',
    password: '12345678',
    role: 'user',
    walletAddress: '0xYourUserWalletAddress'
  }
];

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const u of users) {
      // Check if user already exists to avoid duplicates
      const exists = await User.findOne({ email: u.email });
      
      if (!exists) {
        // Note: hashing is also handled in the pre-save hook, 
        // but keeping it here for explicit script control
        const hashedPassword = await bcrypt.hash(u.password, 10);

        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          walletAddress: u.walletAddress
        });

        console.log(`✅ User created: ${u.email} [Web3 Ready]`);
      } else {
        console.log(`⚠️ User ${u.email} already exists`);
      }
    }

    console.log('🎉 Seeding finished successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Critical Error:', err.message);
    process.exit(1);
  }
};

createUsers();
