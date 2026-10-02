import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './src/models/User.js'; // Verifique se o caminho do seu model está correto

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/hubkon_pay');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminData = {
      name: "Madié Hubkon Master",
      email: "master@hubkon.com",
      password: hashedPassword,
      role: "superadmin",
      isSuperAdmin: true,
      status: "active"
    };

    await User.findOneAndUpdate({ email: adminData.email }, adminData, { upsert: true });
    
    console.log("✅ SUPER ADMIN CRIADO COM SUCESSO!");
    console.log("E-mail: master@hubkon.com | Senha: admin123");
    process.exit();
  } catch (err) {
    console.error("❌ Erro ao criar admin:", err.message);
    process.exit(1);
  }
};

createSuperAdmin();
