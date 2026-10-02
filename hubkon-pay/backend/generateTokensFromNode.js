// generateTokensFromNode.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Importar modelo User
import User from './src/models/userModel.js';

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

async function generateTokens() {
  try {
    await mongoose.connect(MONGO_URI, {});

    console.log('✅ MongoDB conectado');

    const roles = ['SuperAdmin', 'Admin', 'User'];

    for (const role of roles) {
      const user = await User.findOne({ role });
      if (!user) {
        console.log(`❌ ${role} não encontrado`);
        continue;
      }

      const token = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`🎫 Token ${role}:`);
      console.log(token, '\n');
    }

    await mongoose.disconnect();
    console.log('🛑 Conexão MongoDB encerrada');
  } catch (err) {
    console.error('💥 Erro:', err);
  }
}

generateTokens();