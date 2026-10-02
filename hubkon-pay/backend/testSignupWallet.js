// testSignupWallet.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./src/models/UserModel.js";
import Company from "./src/models/CompanyModel.js";
import Wallet from "./src/models/walletModel.js";

import signupRoute from "./src/routes/signupRoute.js";
import express from "express";
import supertest from "supertest";

const app = express();
app.use(express.json());
app.use("/api", signupRoute);

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hubkon-test");

// Função de teste
const testSignupWallet = async () => {
  try {
    const randomEmail = `wallettest${Date.now()}@hubkon.com`;

    // Executa o signup
    const response = await supertest(app)
      .post("/api/signup")
      .send({
        name: "Wallet Test",
        email: randomEmail,
        password: "12345678",
        companyName: "Wallet Test Company",
        plan: "basic"
      });

    console.log("📊 Signup response:", response.body);

    // Checa se a Wallet foi criada
    const userId = response.body.user._id;
    const wallet = await Wallet.findOne({ userId });

    if (wallet) {
      console.log("✅ Wallet created successfully:", wallet);
    } else {
      console.error("❌ Wallet not created!");
    }

    // Cleanup: remove dados de teste
    await User.deleteOne({ _id: userId });
    await Company.deleteOne({ _id: response.body.company._id });
    await Wallet.deleteOne({ _id: wallet._id });

    console.log("🧹 Test data cleaned up.");
    process.exit(0);
  } catch (err) {
    console.error("🔥 Test error:", err);
    process.exit(1);
  }
};

testSignupWallet();