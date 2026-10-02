import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './src/models/userModel.js';

dotenv.config();

async function generateToken() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: 'superadmin@hubkon.com' });
  if (!user) {
    console.error('❌ SuperAdmin não encontrado');
    process.exit(1);
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  console.log('🎫 JWT SuperAdmin:\n');
  console.log(token);

  process.exit(0);
}

generateToken();