import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function clean() {

  await mongoose.connect(process.env.MONGO_URI);

  console.log("✅ Conectado ao MongoDB");

  const result = await mongoose.connection
    .collection("companies")
    .deleteMany({ email: null });

  console.log("🧹 Empresas inválidas removidas:", result.deletedCount);

  process.exit();
}

clean();