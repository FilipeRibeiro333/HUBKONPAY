// createInvoice.js
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  clientName: String,
  amount: Number,
  currency: String,
  status: String,
  paymentMethod: String,
  paymentProof: String,
  createdAt: Date,
  updatedAt: Date
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);

async function main() {
  try {
    // Conexão simples
    await mongoose.connect('mongodb://127.0.0.1:27017/hubkon_pay');

    const invoice = new Invoice({
      clientName: "Empresa Teste",
      amount: 10000,
      currency: "AOA",
      status: "pending",
      paymentMethod: null,
      paymentProof: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await invoice.save();
    console.log('✅ Fatura criada com sucesso:', invoice._id);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
