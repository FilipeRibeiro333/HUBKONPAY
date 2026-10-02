import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const { databases } = await db.admin().listDatabases();
    const masterCollection = db.collection('companies');

    console.log("🚀 Iniciando varredura de nomes comerciais...");

    for (const d of databases) {
      // Pula bancos do sistema e o próprio banco master atual
      if (d.name.startsWith('hubkon') && !['admin', 'local', 'config'].includes(d.name)) {
        
        const remoteDb = mongoose.connection.getClient().db(d.name);
        const realData = await remoteDb.collection('companies').findOne({});

        if (realData && realData.name) {
          console.log(`Sincronizando: ${d.name} -> ${realData.name}`);
          
          // Atualiza no Banco Master usando o taxId como âncora
          await masterCollection.updateOne(
            { taxId: realData.taxId },
            { $set: { name: realData.name } }
          );
        }
      }
    }

    console.log("✨ NOMES REAIS SINCRONIZADOS COM SUCESSO!");
    process.exit(0);
  } catch (err) {
    console.error("🚨 Erro durante a sincronização:", err.message);
    process.exit(1);
  }
}

run();
