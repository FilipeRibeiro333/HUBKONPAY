/**
 * @file importUsers.js
 * @description Bulk B2B Onboarding Script.
 * Imports users from a CSV file and generates JWT access tokens.
 * 
 * @dev Frontier Hackathon: 
 * This script demonstrates how a traditional company can migrate 
 * its workforce into the Hubkon Web3 ecosystem.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const User = require('../src/models/userModel');
const jwt = require('jsonwebtoken');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for Bulk Import');

    const results = [];
    // Ensure 'usuarios.csv' exists in your root folder
    fs.createReadStream('usuarios.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const u of results) {
          try {
            let user = await User.findOne({ email: u.email });
            
            if (!user) {
              // Create new user with Web3 placeholder
              user = await User.create({
                name: u.nome || u.name,
                email: u.email,
                password: u.senha || u.password,
                role: u.role || 'user',
                walletAddress: u.walletAddress || null // Mapping to HubkonID
              });
            } else {
              // Update existing user role/wallet
              user.role = u.role || user.role;
              if (u.walletAddress) user.walletAddress = u.walletAddress;
              await user.save();
            }

            // Generate JWT for Dashboard access
            const token = jwt.sign(
              { id: user._id, email: user.email, role: user.role },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            );

            console.log(`✅ Success: ${user.email} | Role: ${user.role} | Token Generated`);
          } catch (err) {
            console.error(`❌ Error processing ${u.email}:`, err.message);
          }
        }
        console.log('🎉 Bulk Import Completed!');
        // Keep connection open until loop finishes, then close manually if needed
      });
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  }
}

main();
