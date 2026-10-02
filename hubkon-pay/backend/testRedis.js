import mongoose from "mongoose";
import redis from "./src/config/redisClient.js"; // já é o cliente conectado
import User from "./src/models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const TEST_USER_EMAIL = "filipe@test.com";

async function main() {
  try {
    // 🔹 Não chamar redis.connect() se o cliente já estiver conectado

    console.log("✅ Using Redis client");

    // Conecta ao MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Remove o usuário de teste se existir
    await User.deleteOne({ email: TEST_USER_EMAIL });
    console.log(`🧹 Removed existing test user with email: ${TEST_USER_EMAIL}`);

    // Cria usuário de teste
    const user = await User.create({
      name: "Filipe Test",
      email: TEST_USER_EMAIL,
      password: "123456",
      role: "admin",
    });

    console.log("🚀 Test user created:", user.email);

    // Testa cache Redis
    await redis.set("test:user", JSON.stringify(user), "EX", 3600);
    const cached = await redis.get("test:user");
    console.log("♻️ Cached user:", JSON.parse(cached));

    process.exit(0);
  } catch (err) {
    console.error("🔥 Test error:", err);
    process.exit(1);
  }
}

main();