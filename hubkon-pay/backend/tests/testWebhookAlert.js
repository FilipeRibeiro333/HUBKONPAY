/**
 * 📡 HUBKON PAY - REAL WEBHOOK ALERT TEST
 * ---------------------------------------
 * 1. Simula Empresa com Webhook configurado.
 * 2. Dispara Alerta de Pagamento Enterprise ($49.250).
 * 3. Valida a Assinatura Digital no destino.
 */

import dotenv from "dotenv";
dotenv.config();
import { sendWebhook } from "../src/services/webhookService.js";

const runWebhookTest = async () => {
  try {
    // 🏢 SETUP: Simula a "Equipamentos Tech Ltd" (Vendedora)
    const sellerCompany = {
      name: "Equipamentos Tech Ltd",
      // 🔗 COLA AQUI A TUA URL DO WEBHOOK.SITE:
      webhookUrl: "https://webhook.site", 
      webhookSecret: "HUBKON_SECRET_123_ABC"
    };

    // 💰 PAYLOAD: O que o cliente vai receber (Dados do Bloco #1)
    const eventData = {
      escrowId: "69c8665c647a3ca0fcac14c0",
      amountNet: 49250,
      currency: "USD",
      status: "IMMUTABLE_SUCCESS",
      blockIndex: 1,
      // ⚖️ O Selo do Juiz que enviamos no Webhook:
      validatorSignature: "3fbb704464eb02aa69d97ecd9caf9eca..." 
    };

    console.log(`🚀 [WEBHOOK] Disparando alerta para ${sellerCompany.webhookUrl}...`);
    
    await sendWebhook(sellerCompany, "escrow.funds_received", eventData);

    console.log("\n============================================");
    console.log("📡      ALERTA ENVIADO COM SUCESSO!         ");
    console.log("============================================");
    console.log("💡 VERIFICA NO TEU NAVEGADOR (webhook.site)");
    console.log("Tu deves ver o JSON e a 'X-Hubkon-Signature'.");
    console.log("============================================\n");

  } catch (err) {
    console.error("❌ Falha no envio do Webhook:", err.message);
  }
};

runWebhookTest();
