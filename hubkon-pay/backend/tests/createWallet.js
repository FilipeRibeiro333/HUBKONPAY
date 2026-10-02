import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import Wallet from "../src/models/walletModel.js";

dotenv.config();

async function createWallet() {

  await connectDB();

  const userId = new mongoose.Types.ObjectId("69a6bbd092be061a613edb4d");

  const companyId = new mongoose.Types.ObjectId("69b21f036f1431a3c57cbee0");

  const wallet = new Wallet({
    userId,
    companyId,
    balance: 1000,
    currency: "USD"
  });

  await wallet.save();

  console.log("✅ Wallet criada com sucesso!");
  console.log(wallet);

  process.exit();
}

createWallet();