import mongoose from 'mongoose';
import Company from './src/models/companyModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function provision() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 Conectado ao Banco Master...");

    // Tenta remover o índice de email se ele estiver travando o provisionamento manual
    try {
        await Company.collection.dropIndex("email_1");
        console.log("[DB] Índice restritivo removido para provisionamento.");
    } catch (e) {
        // Ignora se o índice não existir
    }

    const instances = [
      { name: "HUBKON MASTER", taxId: "001", email: "master@hubkon.com" },
      { name: "HUBKON BETA", taxId: "002", email: "beta@hubkon.com" },
      { name: "HUBKON GAMMA", taxId: "003", email: "gamma@hubkon.com" },
      { name: "HUBKON DELTA", taxId: "004", email: "delta@hubkon.com" },
      { name: "HUBKON EPSILON", taxId: "005", email: "epsilon@hubkon.com" },
      { name: "HUBKON ZETA", taxId: "006", email: "zeta@hubkon.com" }
    ];

    for (const inst of instances) {
      await Company.findOneAndUpdate(
        { taxId: inst.taxId },
        { 
          $set: {
            name: inst.name,
            email: inst.email, // Email único adicionado
            address: `${inst.name} Infrastructure Node`,
            plan: "enterprise",
            status: "active"
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`✅ INSTÂNCIA ATIVADA: ${inst.name}`);
    }

    console.log("\n✨ Sincronização Global Concluída com Sucesso!");
    process.exit();
  } catch (err) {
    console.error("🚨 Falha no Provisionamento:", err.message);
    process.exit(1);
  }
}

provision();
