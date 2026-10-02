import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import Company from "../src/models/companyModel.js";

dotenv.config();

async function run() {
  await connectDB();

  const companies = await Company.find();

  console.log("📊 Empresas encontradas:");
  console.log(companies);

  process.exit();
}

run();