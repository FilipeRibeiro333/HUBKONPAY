/**
 * @file seedUsers.js
 * @description Database Seeding Utility for HUBKON PAY.
 * Resets the user directory and provisions initial RBAC (Role-Based Access Control) identities.
 * 
 * @dev Frontier Hackathon Context:
 * Essential for testing the onboarding flow and linking Web2 profiles to 
 * Web3 Soulbound Tokens (SBT) for decentralized B2B operations.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../models/userModel.js';

dotenv.config();

/**
 * Initial Test Identity Data
 * @property {string} role - Standardized roles for the Hubkon B2B Dashboard.
 */
const users = [
  { 
    name: 'Super Admin', 
    email: 'superadmin@hubkon.com', 
    password: '12345678', 
    role: 'superadmin',
    walletAddress: null // Future: HubkonID Master Admin Wallet
  },
  { 
    name: 'Admin', 
    email: 'admin@hubkon.com', 
    password: '12345678', 
    role: 'admin',
    walletAddress: null 
  },
  { 
    name: 'User', 
    email: 'user1@hubkon.com', 
    password: '12345678', 
    role: 'user',
    walletAddress: null 
  }
];

/**
 * Executes the database reset and seeding process.
 * @async
 */
const seedUsers = async () => {
  try {
    // 1️⃣ Establish persistence layer connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for data seeding');

    // 2️⃣ Database Purge (Ensures a clean state for testing)
    await User.deleteMany();
    console.log('🧹 Purged: Existing user records removed');

    // 3️⃣ Provisioning Loop
    for (const u of users) {
      // Manual hash for explicit script control
      const hashedPassword = await bcrypt.hash(u.password, 10);
      
      await User.create({ 
        ...u, 
        password: hashedPassword 
      });
      
      console.log(`👤 Provisioned: ${u.email} [Role: ${u.role}]`);
    }

    console.log('🎉 Hubkon Identity Seed successfully completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Critical Failure:', err.message);
    process.exit(1);
  }
};

seedUsers();
