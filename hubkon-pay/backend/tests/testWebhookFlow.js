import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Company from "../src/models/CompanyModel.js";
import { sendWebhook } from "../src/services/webhookService.js";

const testWebhook = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Criar/Atualizar uma empresa com a URL do nosso simulador
    const company = await Company.findOneAndUpdate(
      { email: "cliente@teste.com" },
      { 
        name: "Loja do Cliente",
        webhookUrl: "http://localhost:9000/webhook-receiver",
        webhookSecret: "secret_da_empresa_no_db" 
      },
      { upsert: true, new: true }
    );

    console.log("🚀 Disparando Webhook de Teste...");

    // 2. Simular um evento de Escrow Libertado
    await sendWebhook(company, "escrow.funds_received", {
      escrowId: "69c3e6ff2c9ed8fce863cc2e",
      amount: 98,
      currency: "USD"
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Erro no teste:", err.message);
  }
};

testWebhook();
