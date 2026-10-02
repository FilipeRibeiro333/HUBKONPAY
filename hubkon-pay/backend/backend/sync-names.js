import mongoose from 'mongoose';
import Company from './src/models/companyModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function syncRealNames() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminDb = mongoose.connection.getClient().db().admin();
    
    // 1. Lista todos os bancos físicos no servidor
    const { databases } = await adminDb.listDatabases();
    const tenantDbs = databases.filter(db => 
        db.name.startsWith('hubkon') && !['admin', 'local', 'config'].includes(db.name)
    );

    console.log(`🔍 Varrendo ${tenantDbs.length} bancos de dados por nomes reais...`);

    for (const dbInfo of tenantDbs) {
      const dbName = dbInfo.name;
      const targetDb = mongoose.connection.getClient().db(dbName);
      
      // 2. Busca o nome real dentro da coleção 'companies' desse banco específico
      const realCompanyData = await targetDb.collection('companies').findOne({});
      
      if (realCompanyData && realCompanyData.name) {
        console.log(`[${dbName}] -> Nome Real Encontrado: ${realCompanyData.name}`);

        // 3. Atualiza o registro no teu Banco Master (hubkon_beta)
        await Company.findOneAndUpdate(
          { name: { $regex: new RegExp(dbName.split('_')[1] || dbName, 'i') } }, // Tenta casar pelo sufixo (beta, pay, etc)
          { $set: { name: realCompanyData.name } }
        );
      } else {
        console.log(`[${dbName}] -> Sem registro de nome real ainda.`);
      }
    }

    console.log("\n✨ Sincronização de nomes concluída!");
    process.exit();
  } catch (err) {
    console.error("🚨 Erro na sincronização:", err.message);
    process.exit(1);
  }
}

syncRealNames();
