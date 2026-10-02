import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/UserModel.js";
import Wallet from "../src/models/WalletModel.js";
import Company from "../src/models/CompanyModel.js";

dotenv.config();

export const setupTestEnvironment = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("🧹 Limpando base...");
  await Promise.all([
    User.deleteMany({}),
    Wallet.deleteMany({}),
    Company.deleteMany({}),
  ]);

  const companyA = await Company.create({
    name: "Company A",
    email: "companya@test.com",
  });

  const companyB = await Company.create({
    name: "Company B",
    email: "companyb@test.com",
  });

  const userA = await User.create({
    name: "User A",
    email: "debugusera@hubkon.com",
    password: "Senha123!",
    companyId: companyA._id,
  });

  const userB = await User.create({
    name: "User B",
    email: "debuguserb@hubkon.com",
    password: "Senha123!",
    companyId: companyB._id,
  });

  await Wallet.create({ companyId: companyA._id, balance: 1000 });
  await Wallet.create({ companyId: companyB._id, balance: 1000 });
  await Wallet.create({ isPlatform: true, balance: 0 });

  return { userA, userB };
};