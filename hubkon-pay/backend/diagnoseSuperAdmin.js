// diagnoseSuperAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/UserModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const superAdminData = {
  _id: "69a6bbd092be061a613edb4d", // mesmo do token
  name: "Super Admin",
  email: "superadmin@hubkon.com",
  password: "$2b$12$C4sw6i/H3Lt7ekcOnD4tqetkD43kj4GjJ/xJ/GU8CgHvr7vOmnOPW",
  role: "superadmin",
  companyId: null
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB conectado com sucesso!");

    const user = await User.findOne({ email: superAdminData.email });

    if (user) {
      console.log("🔍 Super Admin encontrado no banco:");
      console.log(user);
    } else {
      console.log("⚠️ Super Admin não encontrado. Criando usuário...");
      const newUser = await User.create(superAdminData);
      console.log("✅ Super Admin criado:", newUser);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Erro:", err);
    process.exit(1);
  }
};

run();