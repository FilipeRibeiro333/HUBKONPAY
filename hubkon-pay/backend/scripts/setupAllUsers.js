/**
 * @file setupUsers.js
 * @description Full Environment Bootstrap for HUBKON PAY.
 * Resets the database and provisions the core RBAC (Role-Based Access Control) hierarchy.
 * 
 * @dev Frontier Hackathon Context:
 * Essential for CI/CD and local development. This script ensures a clean state 
 * for testing the HubkonID (SBT) issuance and B2B payment flows.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/userModel.js'; // Standardized path

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hubkon_pay';

/**
 * Initial Seed Data for the B2B Ecosystem
 * @property {string} role - Defines the tiered access within the platform.
 */
const usersData = [
  { name: 'Super Admin', email: 'superadmin@hubkon.com', password: '123456', role: 'superadmin' },
  { name: 'Admin', email: 'admin@hubkon.com', password: '123456', role: 'admin' },
  { name: 'User1', email: 'user1@hubkon.com', password: '123456', role: 'user' },
];

/**
 * Executes the full database reset and provisioning.
 * @async
 */
const setupUsers = async () => {
  try {
    // 1️⃣ Handshake with the persistence layer
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected for Environment Setup');

    // 2️⃣ Database Purge (Ensuring Idempotency)
    await User.deleteMany({});
    console.log('🧹 Purged: All existing user records removed');

    // 3️⃣ Tiered Provisioning Loop
    for (const u of usersData) {
      // Manual hash for explicit script control
      const hashedPassword = await bcrypt.hash(u.password, 10);
      
      await User.create({ 
        ...u, 
        password: hashedPassword,
        walletAddress: null // Prepared for Web3 Identity Linking (SBT)
      });
      
      console.log(`🎉 Provisioned: ${u.email} [Access Level: ${u.role}]`);
    }

    console.log('\n🔹 B2B Infrastructure: All test identities created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup Critical Failure:', err.message);
    process.exit(1);
  }
};

setupUsers();
