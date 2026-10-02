import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/UserModel.js"; // ← ajusta aqui
import { connectDB } from "../src/config/db.js";

dotenv.config();
await connectDB();

const userData = {
  _id: "69a6bbd092be061a613edb4d",
  name: "Super Admin",
  email: "superadmin@hubkon.com",
  password: "$2b$12$C4sw6i/H3Lt7ekcOnD4tqetkD43kj4GjJ/xJ/GU8CgHvr7vOmnOPW",
  role: "SuperAdmin",
};

try {
  const existing = await User.findOne({ email: userData.email });
  if (existing) {
    console.log("✅ Super Admin já existe");
  } else {
    await User.create(userData);
    console.log("✅ Super Admin criado com sucesso!");
  }
} catch (err) {
  console.error("❌ Erro ao criar Super Admin:", err);
}

process.exit();