// testClaimRewards.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Models
import WalletModel from "./src/models/WalletModel.js";
import UserModel from "./src/models/UserModel.js";

// Conexão ao MongoDB (Node.js 25+ / Mongoose 7+)
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB connected");

// Função para criar usuário com wallet
async function createUser(name, email) {
  // Cria usuário
  const user = new UserModel({
    name,
    email,
    password: "123456", // senha obrigatória
  });
  await user.save();

  // Cria wallet
  const wallet = new WalletModel({
    userId: user._id,
    balance: mongoose.Types.Decimal128.fromString("0"),
  });
  await wallet.save();

  // Atualiza usuário com walletId
  user.walletId = wallet._id;
  await user.save();

  return user;
}

// Função de claim de rewards
async function claimReward(userId, walletId) {
  const user = await UserModel.findById(userId);
  if (!walletId) throw new Error("Usuário não tem walletId definido!");

  const wallet = await WalletModel.findById(walletId);
  if (!wallet) throw new Error("Wallet do usuário não encontrada!");

  // Simulação de reward
  const rewardAmount = mongoose.Types.Decimal128.fromString("0.000003218543886352106");

  // Atualiza saldo
  const currentBalance = parseFloat(wallet.balance.toString());
  const rewardFloat = parseFloat(rewardAmount.toString());
  wallet.balance = mongoose.Types.Decimal128.fromString((currentBalance + rewardFloat).toString());
  await wallet.save();

  console.log("💰 Recompensas resgatadas:", rewardFloat);
  console.log("📄 Transaction log:", {
    from: "staking_pool",
    to: user._id,
    amount: rewardFloat,
    type: "staking_reward",
  });
  console.log("💵 Saldo atualizado do usuário:", parseFloat(wallet.balance.toString()));
}

// Executa teste
(async () => {
  try {
    // Limpa usuário antigo para evitar duplicação
    await UserModel.deleteOne({ email: "filipe@test.com" });

    // Cria novo usuário
    const user = await createUser("Filipe Test", "filipe@test.com");
    console.log("👤 Usuário criado:", user.name, "balance inicial: 0");

    // Executa claim de rewards usando walletId diretamente
    await claimReward(user._id, user.walletId);

  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
  }
})();