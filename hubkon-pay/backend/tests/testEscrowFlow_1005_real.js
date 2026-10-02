import connectDB from "../src/config/db.js";
import Wallet from "../src/models/walletModel.js";
import Escrow from "../src/models/EscrowModel.js";
import Company from "../src/models/CompanyModel.js";

(async () => {
  await connectDB();
  console.log("MongoDB pronto para operações de escrow");

  try {
    // 1️⃣ Criar ou buscar Company A (remetente)
    let companyA = await Company.findOne({ email: "companyA@hubkon.com" });
    if (!companyA) {
      companyA = new Company({
        name: "Company A",
        email: "companyA@hubkon.com",
      });
      await companyA.save();
      console.log("✅ Company A criada:", companyA);
    }

    // 2️⃣ Criar ou buscar Company B (destinatário)
    let companyB = await Company.findOne({ email: "companyB@hubkon.com" });
    if (!companyB) {
      companyB = new Company({
        name: "Company B",
        email: "companyB@hubkon.com",
      });
      await companyB.save();
      console.log("✅ Company B criada:", companyB);
    }

    // 3️⃣ Criar ou buscar Wallet do remetente (Company A)
    let walletA = await Wallet.findOne({ companyId: companyA._id });
    if (!walletA) {
      walletA = new Wallet({
        email: "escrowA@hubkon.com",
        balance: 1000,
        companyId: companyA._id,
      });
      await walletA.save();
      console.log("✅ Wallet A criada:", walletA);
    } else {
      console.log("✅ Wallet A já existe:", walletA);
    }

    // 4️⃣ Criar ou buscar Wallet do destinatário (Company B)
    let walletB = await Wallet.findOne({ companyId: companyB._id });
    if (!walletB) {
      walletB = new Wallet({
        email: "escrowB@hubkon.com",
        balance: 500,
        companyId: companyB._id,
      });
      await walletB.save();
      console.log("✅ Wallet B criada:", walletB);
    } else {
      console.log("✅ Wallet B já existe:", walletB);
    }

    // 5️⃣ Criar Escrow de teste
    const escrow = new Escrow({
      senderWalletId: walletA._id,
      receiverWalletId: walletB._id,
      companyA: companyA._id,
      companyB: companyB._id,
      amount: 200,
      status: "pending", // ⚠️ status inicial válido
      createdAt: new Date(),
    });
    await escrow.save();
    console.log("✅ Escrow criado:", escrow);

    // 6️⃣ Atualizar saldo do remetente
    walletA.balance -= 200;
    await walletA.save();
    console.log("✅ Saldo atualizado Wallet A:", walletA.balance);

    // 7️⃣ Finalizar escrow usando valor válido do enum
    escrow.status = "released"; // ⚠️ valor permitido pelo schema
    await escrow.save();
    console.log("✅ Escrow concluído:", escrow.status);

  } catch (err) {
    console.error("❌ Erro no fluxo de escrow:", err.message);
  } finally {
    await Wallet.db.close();
    console.log("MongoDB desconectado, teste de escrow finalizado");
  }
})();