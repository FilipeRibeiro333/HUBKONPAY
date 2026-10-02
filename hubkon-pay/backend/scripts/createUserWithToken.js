/**
 * @file createUserWithToken.js
 * @description Administrative CLI tool to provision users and generate session tokens.
 * 
 * @dev Frontier Hackathon: 
 * This tool allows platform admins to quickly onboard B2B clients and test 
 * permission-gated Web3 features (SBT-based payments).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/userModel');

// CLI Arguments
const email = process.argv[2];
const name = process.argv[3] || 'New Hubkon User';
const password = process.argv[4] || '123456';
const roleArg = process.argv[5] || 'user'; // 'admin', 'user', etc.

if (!email) {
  console.error('❌ Usage: node scripts/createUserWithToken.js <email> [name] [password] [role]');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let user = await User.findOne({ email });

    if (user) {
      console.log(`⚠️ User already exists: ${email}`);
      // Update role if explicitly requested in CLI
      if (roleArg !== user.role) {
        user.role = roleArg;
        await user.save();
        console.log(`✅ User role updated to [${roleArg}]: ${email}`);
      }
    } else {
      // Create new user compatible with the Hybrid B2B Model (Web2 + Web3)
      user = await User.create({ 
        name, 
        email, 
        password, 
        role: roleArg,
        walletAddress: null // To be linked via HubkonID (SBT)
      });
      console.log(`✅ New User created: ${email} [Role: ${roleArg}]`);
    }

    // Generate JWT (Bearer Token) for Dashboard Authorization
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('\n🔑 JWT Token generated for B2B Session:');
    console.log(token);
    console.log('\n💡 Security Header:');
    console.log(`Authorization: Bearer ${token}\n`);

    process.exit(0);
  } catch (err) {
    console.error('💥 Critical Error:', err.message);
    process.exit(1);
  }
}

main();
