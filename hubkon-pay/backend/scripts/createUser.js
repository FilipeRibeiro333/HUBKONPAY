/**
 * @file createUser.js
 * @description Database Seeding Script for Hubkon Ecosystem.
 * Pre-populates the environment with different permission levels (Admin/User).
 * 
 * @dev Integration for Solana Frontier Hackathon:
 * We map traditional Web2 roles to Web3 Soulbound Tokens (SBT).
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/userModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Connection handling with enhanced logging for DevOps clarity
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connection established'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

/**
 * Initial Users Mock Data
 * @property {string} role - Defines access level within the B2B dashboard.
 * @property {string} walletAddress - (Future) Mapping to the HubkonID Smart Contract.
 */
const users = [
  { 
    name: 'Admin', 
    email: 'admin@hubkon.com', 
    password: '123456', 
    role: 'admin',
    walletAddress: '0x0000000000000000000000000000000000000000' // Placeholder for SBT holder
  },
  { 
    name: 'User1', 
    email: 'user1@hubkon.com', 
    password: '123456', 
    role: 'user',
    walletAddress: '0x0000000000000000000000000000000000000000'
  }
];

async function createUsers() {
  try {
    for (const u of users) {
      // Prevent duplication during repeated runs
      const exists = await User.findOne({ email: u.email });
      
      if (!exists) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await User.create({ ...u, password: hashedPassword });
        console.log(`✅ Success: User ${u.email} created with role [${u.role}]`);
      } else {
        console.log(`⚠️ Skip: User ${u.email} already exists in the system`);
      }
    }
  } catch (error) {
    console.error('❌ Seed Script Failed:', error.message);
  } finally {
    // Ensuring clean exit from the process
    mongoose.connection.close();
    console.log('🎉 Seed Script Finished - Database is ready for B2B testing');
  }
}

createUsers();
