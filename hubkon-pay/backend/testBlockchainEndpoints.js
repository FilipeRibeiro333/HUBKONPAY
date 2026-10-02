import axios from "axios";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = "mongodb://127.0.0.1:27017/hubkon";
await mongoose.connect(MONGO_URI);
console.log("✅ MongoDB conectado para testes");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const adminEmail = "admin@hubkon.com";
const adminPassword = "12345678";

async function ensureAdminUser() {
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      email: adminEmail,
      password: hashed,
      role: "admin",
    });
    console.log("✅ Usuário admin criado no banco");
  } else {
    console.log("✅ Usuário admin já existe");
  }
}

async function login() {
  const res = await axios.post("http://localhost:5000/api/auth/login", {
    email: adminEmail,
    password: adminPassword,
  });
  console.log("✅ Login realizado");
  return res.data.token;
}

async function testBlockchain(token) {
  const res = await axios.get(
    "http://localhost:5000/api/blockchain/chain",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  console.log("📦 Blockchain:", res.data);
}

(async () => {
  await ensureAdminUser();
  const token = await login();
  await testBlockchain(token);
  await mongoose.disconnect();
})();