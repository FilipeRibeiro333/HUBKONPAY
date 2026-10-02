// testTransactions.js
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const { createGenesisBlock, addBlock, validateChain, clearBlockchain } = require('./src/blockchain/blockchain');
const Transaction = require('./src/blockchain/transaction');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

async function main() {
  // Conecta ao MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB conectado para teste de transações');

  // Limpa blockchain antiga
  await clearBlockchain();
  console.log('🧹 Blockchain antiga removida.');

  // Cria o Genesis Block
  const genesis = await createGenesisBlock();
  console.log('⛓️ Blockchain iniciada:', genesis);

  // Cria carteiras
  const keyA = ec.genKeyPair();
  const walletA = {
    privateKey: keyA.getPrivate('hex'),
    publicKey: keyA.getPublic('hex')
  };

  const keyB = ec.genKeyPair();
  const walletB = {
    privateKey: keyB.getPrivate('hex'),
    publicKey: keyB.getPublic('hex')
  };

  console.log('💼 Carteiras criadas');
  console.log('Wallet A Public:', walletA.publicKey);
  console.log('Wallet B Public:', walletB.publicKey);

  // Cria transação e assina
  const tx = new Transaction(walletA.publicKey, walletB.publicKey, 50);
  tx.signTransaction(walletA.privateKey);
  console.log('✍️ Transação assinada:', tx);

  // Adiciona bloco com transação
  const minedBlock = await addBlock([tx]);
  console.log('⛏️ Bloco minerado:', minedBlock);

  // Valida blockchain
  const result = await validateChain();
  console.log('🔍 Blockchain validada:', result);

  process.exit(0);
}

main().catch(err => {
  console.error('💥 ERRO nos testes de transação:', err);
  process.exit(1);
});