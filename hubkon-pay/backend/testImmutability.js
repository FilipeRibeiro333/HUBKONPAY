const mongoose = require('mongoose');
require('dotenv').config();

const Block = require('./src/blockchain/blockModel');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Mongo conectado");

  const block = await Block.findOne({ index: 1 });

  if (!block) {
    console.log("Bloco não encontrado.");
    process.exit();
  }

  console.log("Bloco encontrado:", block.index);
  console.log("Tentando alterar hash...");

  block.hash = "HACKED_HASH";

  try {
    await block.save();
  } catch (error) {
    console.log("ERRO ESPERADO:", error.message);
  }

  process.exit();
}

test();