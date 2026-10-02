import mongoose from "mongoose";
import dotenv from "dotenv";
import Company from "./src/models/CompanyModel.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB conectado");

  const result = await Company.deleteMany({ email: /@hubkon\.com$/ });
  console.log("🧹 Empresas de teste removidas:", result.deletedCount);

  await mongoose.disconnect();
  console.log("🛑 Conexão encerrada");
}

run();