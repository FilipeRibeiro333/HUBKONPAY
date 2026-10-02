// checkApiKeys.js
import mongoose from "mongoose";
import ApiKey from "./src/models/apiKeyModel.js";

async function main() {
  try {
    // 1️⃣ Conectar ao MongoDB sem opções obsoletas
    await mongoose.connect("mongodb://localhost:27017/hubkon_pay");
    console.log("✅ Conectado ao MongoDB");

    // 2️⃣ Buscar todas as API Keys
    const keys = await ApiKey.find({}).lean();

    if (keys.length === 0) {
      console.log("⚠️ Nenhuma API Key encontrada!");
    } else {
      console.log(`🔑 Encontradas ${keys.length} API Key(s):\n`);
      keys.forEach((k, i) => {
        console.log(
          `${i + 1}. CompanyId: ${k.companyId}, Key: ${k.key}, Criada em: ${k.createdAt}`
        );
      });

      // 3️⃣ Verificar se a PLATFORM_KEY_001 existe
      const platformKey = keys.find((k) => k.key === "PLATFORM_KEY_001");
      if (platformKey) {
        console.log("\n✅ PLATFORM_KEY_001 existe no banco de dados!");
      } else {
        console.log("\n❌ PLATFORM_KEY_001 NÃO existe no banco de dados!");
      }
    }
  } catch (err) {
    console.error("❌ Erro ao verificar API Keys:", err);
  } finally {
    // 4️⃣ Fechar conexão
    await mongoose.connection.close();
    console.log("🔌 Conexão com MongoDB encerrada");
  }
}

main();