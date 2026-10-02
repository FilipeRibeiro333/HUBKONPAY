require("dotenv").config();
const { sendEmail } = require("./src/utils/email");

(async () => {
  try {
    await sendEmail({
      to: "franciscaalexandrerosa@gmail.com",
      subject: "Teste HUBKON PAY",
      html: "<h1>Email real funcionando 🚀</h1><p>Backend HUBKON ativo.</p>",
    });

    console.log("✅ Teste finalizado");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro envio:", err.message);
    process.exit(1);
  }
})();
