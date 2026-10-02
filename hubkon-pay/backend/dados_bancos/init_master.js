import mongoose from 'mongoose';

const dbs = ['hubkon_pay', 'hubkon_beta', 'hubkon_gamma', 'hubkon_delta', 'hubkon_epsilon', 'hubkon_zeta'];

async function bootstrap() {
  console.log("🚀 Provisionando Instâncias Hubkon...");
  
  for (const db of dbs) {
    try {
      // Conecta, cria um registro e fecha
      const uri = `mongodb://127.0.0.1:27017/${db}?replicaSet=rs0`;
      const conn = await mongoose.createConnection(uri).asPromise();
      await conn.collection('infra_status').insertOne({ active: true, createdAt: new Date() });
      console.log(`✅ [${db}] Ativado com sucesso.`);
      await conn.close();
    } catch (err) {
      console.error(`❌ Falha em ${db}:`, err.message);
    }
  }
  console.log("\n🏁 Sistema Multi-Instance Pronto.");
  process.exit();
}

bootstrap();
