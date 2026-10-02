require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Conectado ao MongoDB");

    const users = await mongoose.connection.db.collection("users").find().toArray();
    console.log("📄 Usuários no banco:");
    console.log(users);

    process.exit();
  })
  .catch(err => {
    console.error("❌ Erro:", err);
  });