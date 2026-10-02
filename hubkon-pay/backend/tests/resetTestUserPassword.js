import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/userModel.js";

dotenv.config();

async function resetPassword() {

  await connectDB();

  const email = "testuser@hubkon.com";
  const newPassword = "Test1234!";

  const user = await User.findOne({ email });

  if (!user) {
    console.log("❌ User not found");
    process.exit();
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  user.password = hashed;
  await user.save();

  console.log("✅ Password reset successful");
  console.log("Email:", email);
  console.log("Password:", newPassword);

  process.exit();
}

resetPassword();