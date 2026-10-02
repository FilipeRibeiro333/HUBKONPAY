const mongoose = require('mongoose');
const { getModel } = require('./index');

const ProductSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  estoque: { type: Number, default: 0 },
});

module.exports = getModel('Product', ProductSchema);
