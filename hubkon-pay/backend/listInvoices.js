require('dotenv').config();
const mongoose = require('mongoose');
const Invoice = require('./src/models/Invoice'); // usa o modelo atualizado

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    const invoices = await Invoice.find();
    if (invoices.length === 0) {
      console.log('⚠️ Nenhuma invoice encontrada. Criando invoices de teste...');

      const invoicesData = [
        { numero: 'INV001', amount: 1000, clientName: 'João', currency: 'AOA', status: 'pending' },
        { numero: 'INV002', amount: 500, clientName: 'Maria', currency: 'AOA', status: 'pending' },
        { numero: 'INV003', amount: 2000, clientName: 'Pedro', currency: 'AOA', status: 'pending' },
        { numero: 'INV004', amount: 1500, clientName: 'Ana', currency: 'AOA', status: 'pending' },
        { numero: 'INV005', amount: 3000, clientName: 'Carlos', currency: 'AOA', status: 'pending' }
      ];

      const createdInvoices = await Invoice.insertMany(invoicesData);
      console.log('✅ Invoices de teste criadas:');
      createdInvoices.forEach(inv => console.log(`- ${inv.numero} | ${inv.clientName} | ${inv.amount} AOA`));
    } else {
      console.log('📄 Invoices existentes:');
      invoices.forEach(inv => {
        console.log(`- ${inv.numero} | ${inv.clientName} | ${inv.amount} AOA | ${inv.status}`);
      });
    }
  } catch (err) {
    console.error('❌ Erro ao listar/criar invoices:', err);
  } finally {
    mongoose.connection.close();
  }
}

main();
