/**
 * @file resetUsers.js
 * @description Administrative utility to purge the User collection.
 * 
 * @dev Frontier Hackathon Context:
 * Essential for testing the onboarding flow from scratch, ensuring that 
 * Soulbound Token (SBT) mappings to Web2 accounts start from a clean state.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/userModel.js';

dotenv.config();

/**
 * Resets the User database.
 * @async
 */
const reset = async () => {
  try {
    // Establishing persistence layer connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for maintenance');

    // Perform bulk deletion of all user records
    // @notice This action is irreversible and clears all Web3 wallet mappings
    await User.deleteMany({});
    console.log('🧹 Cleanup Complete: All user records have been removed');

    process.exit(0);
  } catch (err) {
    console.error('❌ Critical Maintenance Error:', err.message);
    process.exit(1);
  }
};

reset();
