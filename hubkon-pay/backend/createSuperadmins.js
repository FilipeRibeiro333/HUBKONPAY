import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/userModel.js';

dotenv.config();

const superadmins = [
  { name: "SuperAdmin Master", email: "master@hubkon.com", password: "MasterPassword123!" },
  { name: "Admin Geral 01", email: "admin.geral1@hubkon.com", password: "SecureAdmin123!" },
  { name: "Admin Geral 02", email: "admin.geral2@hubkon.com", password: "SecureAdmin456!" },
  { name: "Auditores HUBKON", email: "audit@hubkon.com", password: "AuditPassword789!" }
];

async function seedSuperadmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado ao MongoDB para provisionamento global.");

    for (const adminData of superadmins) {
      const exists = await User.findOne({ email: adminData.email });
      
      if (!exists) {
        // Criamos com role 'superadmin' e SEM companyId
        await User.create({
          ...adminData,
          role: 'superadmin',
          companyId: null // Superadmins não têm amarras com tenants específicos
        });
        console.log(`✅ Superadmin criado: ${adminData.email}`);
      } else {
        console.log(`⚠️ Superadmin já existe: ${adminData.email}`);
      }
    }

    console.log("\n🏁 Provisionamento de Elite Concluído.");
    process.exit();
  } catch (err) {
    console.error("❌ Falha no provisionamento:", err.message);
    process.exit(1);
  }
}

seedSuperadmins();
