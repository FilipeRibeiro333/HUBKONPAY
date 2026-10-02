/**
 * @file createAdmin.js
 * @description Script to bootstrap the initial SuperAdmin for the Hubkon Ecosystem.
 * In a B2B context, this admin will have the authority to issue Web3 Soulbound Tokens (SBT).
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/userModel.js'; 

dotenv.config();

/**
 * Creates the root administrator.
 * @dev Integration point: The email/password login will later be linked 
 * to a Wallet Address to authorize On-Chain Identity Issuance.
 */
const createSuperAdmin = async () => {
  try {
    // Establishing connection to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected successfully');

    // Hashing password for secure storage
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // Initializing the SuperAdmin record
    // @notice The role must remain lowercase to match backend middleware checks
    await User.create({
      name: 'Super Admin',
      email: 'superadmin@hubkon.com',
      password: hashedPassword,
      role: 'superadmin',
      // TODO: Add 'walletAddress' field to sync with HubkonID Smart Contract
    });

    console.log('🎉 SuperAdmin created successfully - Ready for B2B Operations');
    process.exit(0);
  } catch (err) {
    console.error('❌ Critical Error during Admin creation:', err.message);
    process.exit(1);
  }
};

createSuperAdmin();
