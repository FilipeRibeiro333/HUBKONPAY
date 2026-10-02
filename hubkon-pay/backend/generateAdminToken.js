// generateAdminToken.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/userModel.js";
import jwt from "jsonwebtoken";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hubkon_pay";

const generateToken = async () => {
  await mongoose.connect(MONGO_URI);
  const admin = await User.findOne({ email: "admin@hubkon.com" });

  if (!admin) {
    console.log("Admin não encontrado");
    process.exit(1);
  }

  // Gerar JWT para teste
  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET || "testsecret",
    { expiresIn: "1h" }
  );

  console.log("✅ Token de teste do admin:", token);
  process.exit(0);
};

generateToken();