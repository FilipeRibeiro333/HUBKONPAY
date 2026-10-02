import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const PORT = 9000;
const CUSTOMER_SECRET = "secret_da_empresa_no_db"; // O webhookSecret que está no teu CompanyModel

app.post("/webhook-receiver", (req, res) => {
  const signature = req.headers["x-hubkon-signature"];
  const payload = JSON.stringify(req.body);

  // 🔒 Validar se o aviso veio mesmo da tua plataforma (HUBKON)
  const expectedSignature = crypto
    .createHmac("sha256", CUSTOMER_SECRET)
    .update(payload)
    .digest("hex");

  if (signature === expectedSignature) {
    console.log("\n🔔 [WEBHOOK RECEBIDO E VALIDADO!] 🔔");
    console.log("Evento:", req.body.event);
    console.log("Dados:", req.body.data);
    res.status(200).send("OK");
  } else {
    console.log("❌ [WEBHOOK INVÁLIDO] Assinatura não confere!");
    res.status(401).send("Unauthorized");
  }
});

app.listen(PORT, () => console.log(`📡 Servidor do Cliente ouvindo na porta ${PORT}...`));
