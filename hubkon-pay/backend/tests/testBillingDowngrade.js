import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Company from "../src/models/CompanyModel.js";
import { processDailyBilling } from "../src/services/billingService.js";

const runBillingTest = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI não definida no .env");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para Teste de Cobrança\n");

    // 1. Limpeza Total
    await Company.deleteMany({ email: "devedor@empresa.com" });

    // 2. Criar a empresa primeiro
    console.log("🏢 Criando devedor (Nível Enterprise)...");
    const devedor = await Company.create({
      name: "Devedor S.A.",
      email: "devedor@empresa.com",
      plan: "enterprise",
      subscriptionStatus: "active"
    });

    // ⚡ A MARRETA: Injeção direta no MongoDB para garantir expiração (Ontem)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); 

    await Company.collection.updateOne(
        { _id: devedor._id },
        { $set: { subscriptionExpiresAt: yesterday } }
    );

    // 🔍 RE-BUSCAR PARA CONFIRMAR
    const check = await Company.findById(devedor._id).lean();
    
    if (!check || !check.subscriptionExpiresAt) {
      throw new Error("O campo 'subscriptionExpiresAt' não foi encontrado. Reinicia o teu MongoDB!");
    }

    const planoInicial = (check.plan || "enterprise").toUpperCase();
    console.log(`📊 Plano Atual: ${planoInicial}`);
    console.log(`📅 Expiração Forçada: ${new Date(check.subscriptionExpiresAt).toDateString()} (ONTEM)`);

    // 3. EXECUÇÃO DO MOTOR DE BILLING (O Cobrador Implacável)
    console.log("\n⚙️  Rodando Motor de Billing Automático...");
    await processDailyBilling();

    // 4. VERIFICAÇÃO FINAL (Re-buscar dados após o processo)
    const updated = await Company.findById(devedor._id).lean();

    console.log("\n============================================");
    console.log("💳      RELATÓRIO DE SUSPENSÃO HUBKON       ");
    console.log("============================================");
    
    // 🛡️ Proteção Anti-Crash: Caso o campo venha undefined, o teste não morre
    const planoFinal = (updated?.plan || "basic").toUpperCase();
    const statusFinal = (updated?.subscriptionStatus || "expired").toUpperCase();

    console.log(`✅ NOVO PLANO: ${planoFinal} 📉`);
    console.log(`✅ STATUS:     ${statusFinal}`);
    console.log("============================================\n");

    if (updated?.plan === "basic") {
      console.log("🔥 SUCESSO: O devedor foi rebaixado automaticamente!");
    } else {
      console.log("⚠️ ATENÇÃO: O plano não mudou. Verifica se o filtro do BillingService é implacável.");
    }

    await mongoose.disconnect();
    console.log("🔌 Teste finalizado.");

  } catch (err) {
    console.error("\n❌ Falha no Teste:", err.message);
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runBillingTest();
