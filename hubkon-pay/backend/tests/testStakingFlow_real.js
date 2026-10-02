import connectDB from "../src/config/db.js";
import Wallet from "../src/models/walletModel.js";
import Staking from "../src/models/StakingModel.js";
import Company from "../src/models/CompanyModel.js";

(async () => {
  await connectDB();
  console.log("MongoDB pronto para operações de staking");

  try {
    // 1️⃣ Buscar ou criar Company de teste
    let company = await Company.findOne({ email: "test@company.com" });
    if (!company) {
      company = new Company({
        name: "Test Company",
        email: "test@company.com", // obrigatório
      });
      await company.save();
      console.log("✅ Company de teste criada:", company);
    }

    // 2️⃣ Buscar ou criar Wallet de teste (uma por Company)
    let wallet = await Wallet.findOne({ companyId: company._id });
    if (!wallet) {
      wallet = new Wallet({
        email: "stakinguser@hubkon.com",
        balance: 1000,
        companyId: company._id,
      });
      await wallet.save();
      console.log("✅ Wallet de teste criada:", wallet);
    } else {
      console.log("✅ Wallet de teste já existe:", wallet);
    }

    // 3️⃣ Criar staking de teste
    const staking = new Staking({
      walletId: wallet._id,
      companyId: wallet.companyId, // ⚠️ necessário
      amount: 100,
      status: "active",
      createdAt: new Date(),
    });
    await staking.save();
    console.log("✅ Staking criado:", staking);

    // 4️⃣ Atualizar saldo
    wallet.balance -= 100;
    await wallet.save();
    console.log("✅ Saldo atualizado:", wallet.balance);

  } catch (err) {
    console.error("❌ Erro no fluxo de staking:", err.message);
  } finally {
    await Wallet.db.close();
    console.log("MongoDB desconectado, teste de staking finalizado");
  }
})();