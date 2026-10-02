/**
 * @file findUser.js
 * @description Forensic scanner to view all users and their exact companyIds.
 * Version: V.1025 ✅
 */
import connectDB from "./src/config/db.js";
import User from "./src/models/userModel.js";

const scanUsers = async () => {
  await connectDB();
  console.log("🔍 [SRO SCAN] Listando todos os utilizadores no banco hubkon_beta...\n");
  
  const allUsers = await User.find({}).select("name email role companyId");
  
  allUsers.forEach((u, i) => {
    console.log(`[USER ${i+1}] ────`);
    console.log(`🔹 Nome: "${u.name}"`);
    console.log(`🔹 Email: ${u.email}`);
    console.log(`🔹 Role: ${u.role}`);
    console.log(`🏢 CompanyId: ${u.companyId || "NENHUMA VINCULADA"}\n`);
  });
  
  process.exit(0);
};

scanUsers();
