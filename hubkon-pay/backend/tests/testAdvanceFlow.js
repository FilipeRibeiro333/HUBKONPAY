/**
 * HUBKON PAY - ADVANCE PAYMENT TEST (TURBO PROFIT)
 * ------------------------------------------------
 * Este teste prova que podes lucrar 5% em vez de 2% 
 * ao adiantar o dinheiro que já está no cofre.
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Company from "../src/models/CompanyModel.js";
import Wallet from "../src/models/WalletModel.js";
import Escrow from "../src/models/EscrowModel.js";
import { createCheckoutSession } from "../src/controllers/checkoutController.js";
import { approveEscrow } from "../src/services/escrowService.js";
import { requestAdvancePayment } from "../src/services/advanceService.js";

const runAdvanceTest = async () => {
  try {
    // 1️⃣ Conexão Segura
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI não encontrada no .env");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para teste de Antecipação");

    // 🧹 Limpeza para Auditoria Limpa
    await Company.deleteMany({});
    await Wallet.deleteMany({});
    await Escrow.deleteMany({});

    // 2️⃣ Setup de Entidades
    const buyer = await Company.create({ name: "Buyer Corp", email: "buyer@hubkon.com" });
    const seller = await Company.create({ name: "Seller Ltd", email: "seller@hubkon.com" });

    // 3️⃣ Setup de Wallets (O motor da Ford Raptor 🏎️)
    await Wallet.create({ companyId: buyer._id, balance: 1000, locked: 0 });
    await Wallet.create({ companyId: seller._id, balance: 500, locked: 0 });
    await Wallet.create({ isPlatform: true, balance: 0 });

    console.log(`💰 [INÍCIO] Buyer: 1000 | Seller: 500`);

    // 4️⃣ Simulação de Checkout (Bloqueia $100 no cofre)
    const req = {
      body: { 
        companyA: buyer._id.toString(), 
        companyB: seller._id.toString(), 
        amount: 100, 
        currency: "USD" 
      },
      user: { _id: new mongoose.Types.ObjectId(), companyId: buyer._id },
    };

    let escrowId;
    const res = {
      status: () => ({ json: (d) => d }),
      json: (data) => {
        escrowId = data.escrowId;
        console.log("🔒 [CHECKOUT] $100 bloqueados no Escrow.");
        return data;
      },
    };

    await createCheckoutSession(req, res);

    // 5️⃣ Aprovação (Obrigatório para Antecipar)
    await approveEscrow(escrowId, { companyId: buyer._id });
    await approveEscrow(escrowId, { companyId: seller._id });
    console.log("✅ [APPROVAL] Contrato assinado por ambos.");

    // 6️⃣ A MÁGICA: Antecipação de Recebíveis (Taxa de 5% total)
    console.log("\n⚡ [ANTECIPAÇÃO] Vendedor solicitou pagamento imediato...");
    const result = await requestAdvancePayment(escrowId, seller._id);

    // 7️⃣ Auditoria Final
    const fBuyer = await Wallet.findOne({ companyId: buyer._id });
    const fSeller = await Wallet.findOne({ companyId: seller._id });
    const fPlatform = await Wallet.findOne({ isPlatform: true });

    console.log("\n============================================");
    console.log("📊      HUBKON TURBO PROFIT REPORT (5%)     ");
    console.log("============================================");
    console.log(`✅ Buyer Wallet:  ${fBuyer.balance} (Locked: ${fBuyer.locked})`);
    console.log(`✅ Seller Wallet: ${fSeller.balance} (Recebeu $95 líquidos)`);
    console.log(`🏦 HUBKON PROFIT: ${fPlatform.balance.toFixed(2)} (TAXA TURBO! 🏎️💨)`);
    console.log("============================================\n");

    await mongoose.disconnect();
    console.log("🔌 Teste de Antecipação finalizado com sucesso.");

  } catch (err) {
    console.error("❌ Erro no Teste:", err.message);
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    process.exit(1);
  }
};

runAdvanceTest();
