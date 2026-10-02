import { MongoClient } from "mongodb";

// URL de conexão com MongoDB (substitua com seu usuário e senha corretos)
const uri = "mongodb://<usuarioAdmin>:<senhaAdmin>@localhost:27017/hubkon?authSource=admin";
const client = new MongoClient(uri);

async function listarUsuarios() {
  try {
    await client.connect();
    const db = client.db("hubkon"); // banco onde seus usuários estão
    const users = await db.collection("users").find({}).toArray(); // pega todos os usuários

    console.log("📋 Usuários existentes no banco:");
    users.forEach(u => {
      console.log(`- Nome: ${u.name}, Email: ${u.email}, ID: ${u._id}`);
    });
  } catch (err) {
    console.error("❌ Erro ao listar usuários:", err);
  } finally {
    await client.close();
  }
}

listarUsuarios();