/**
 * @file makeAdmin.js
 * @description Administrative CLI utility to promote users to 'admin' role.
 * 
 * @dev Frontier Hackathon Context:
 * In the Hubkon B2B ecosystem, promoting a user to 'admin' in the database 
 * is the first step to authorizing them to issue Soulbound Tokens (SBT) 
 * for corporate identity and payment approvals.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/userModel');

// CLI Argument: Target user email
const email = process.argv[2]; 

if (!email) {
  console.error('❌ Please provide the user email as an argument: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

/**
 * Execution logic for role elevation.
 * @async
 */
async function run() {
  try {
    // Establish persistence layer connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for administrative override');

    // Update user role to 'admin' to unlock B2B management features
    const result = await User.updateOne(
      { email: email.toLowerCase().trim() }, 
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log('⚠️ User not found in the Hubkon database');
    } else if (result.modifiedCount === 0) {
      console.log(`⚠️ User ${email} is already an administrator`);
    } else {
      console.log(`✅ Success: User ${email} has been promoted to ADMIN`);
      console.log('🚀 Role synced. User can now manage HubkonID (SBT) permissions.');
    }

    process.exit(0);
  } catch (err) {
    console.error('💥 Critical Update Error:', err.message);
    process.exit(1);
  }
}

run();
