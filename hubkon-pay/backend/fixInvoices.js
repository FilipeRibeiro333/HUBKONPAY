// backend/fixInvoices.js
require('dotenv').config();
const mongoose = require('mongoose');
const Invoice = require('./src/models/Invoice');

async function updateInvoices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    const invoices = await Invoice.find();
    console.log(`📄 Total de invoices no banco: ${invoices.length}`);

    let updatedCount = 0;
    let skippedCount = 0;
    let invalidCount = 0;

    for (const inv of invoices) {
      try {
        // Validação do campo "valor"
        if (inv.valor === undefined || inv.valor === null) {
          console.log(`❌ Invoice ${inv._id} inválida: valor ausente`);
          invalidCount++;
          continue;
        }

        if (inv.valor < 0) {
          console.log(`❌ Invoice ${inv._id} inválida: valor negativo (${inv.valor})`);
          invalidCount++;
          continue;
        }

        // Atualiza apenas invoices que não têm "amount"
        if (!inv.amount) {
          inv.amount = inv.valor;
          await inv.save();
          updatedCount++;
          console.log(`⚡ Invoice ${inv._id} atualizada: amount = ${inv.amount}`);
        } else {
          skippedCount++;
          console.log(`⏭ Invoice ${inv._id} já possui amount`);
        }
      } catch (innerErr) {
        console.error(`❌ Erro ao atualizar Invoice ${inv._id}:`, innerErr.message);
      }
    }

    console.log('\n✅ Atualização finalizada:');
    console.log(`   🔹 Total de invoices atualizadas: ${updatedCount}`);
    console.log(`   ⏭ Total de invoices já atualizadas: ${skippedCount}`);
    console.log(`   ❌ Total de invoices inválidas: ${invalidCount}`);
  } catch (err) {
    console.error('❌ Erro geral ao atualizar invoices:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Conexão com MongoDB encerrada');
  }
}

// Executa o script
updateInvoices();

// Para rodar periodicamente:
// use um cron job ou scheduler do sistema para rodar "node fixInvoices.js" automaticamente

