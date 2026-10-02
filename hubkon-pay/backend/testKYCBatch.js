// ==========================
// testKYCBatch.js (versão limpa)
// ==========================

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ override: true });

// Models
import UserModel from "./src/models/UserModel.js";
import WalletModel from "./src/models/WalletModel.js";

// Conexão MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB conectado");

// Função de KYC Batch
async function runKYCBatch() {
  try {
    // Lista de emails de usuários a processar
    const emails = [
      "superadmin@hubkon.com",
      "testuser@hubkon.com",
      "userA@company.com",
      "userB@company.com",
    ];

    for (const email of emails) {
      try {
        // Procura usuário existente
        const user = await UserModel.findOne({ email });
        if (!user) {
          console.log(`❌ Usuário não encontrado: ${email}`);
          continue;
        }

        // Confirma wallet
        let wallet = await WalletModel.findOne({ userId: user._id });
        if (!wallet) {
          // Cria wallet se não existir
          wallet = new WalletModel({
            userId: user._id,
            balance: mongoose.Types.Decimal128.fromString("0"),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await wallet.save();

          // Atualiza usuário com walletId
          user.walletId = wallet._id;
          await user.save();
          console.log(`💳 Wallet criada para: ${email}`);
        } else {
          console.log(`💳 Wallet já existe para: ${email}`);
        }

        // Marca KYC como processado (exemplo, adaptável ao teu schema)
        user.kycProcessed = true;
        await user.save();
        console.log(`✅ KYC processado para: ${email}`);

      } catch (err) {
        console.log(`❌ Erro para ${email}:`, err.message);
      }
    }

    console.log("✅ Batch de KYC finalizado!");

  } catch (err) {
    console.error("❌ Erro no batch:", err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ MongoDB desconectado");
  }
}

// Executa o batch
runKYCBatch();