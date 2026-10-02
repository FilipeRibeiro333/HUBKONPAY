// testTokens.js (Avançado)
require('dotenv').config();
const Blockchain = require('./src/blockchain/Blockchain');
const { Transaction } = require('./src/blockchain/Transaction');
const { Wallet } = require('./src/blockchain/Wallet');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

async function main() {
  console.log('✅ Blockchain instanciada como classe');
  const blockchain = new Blockchain();

  console.log('✅ Iniciando simulação avançada de tokens e staking');

  // ------------------------
  // 1️⃣ Criar 3 carteiras
  // ------------------------
  const walletA = new Wallet();
  const walletB = new Wallet();
  const walletC = new Wallet();

  const wallets = [walletA, walletB, walletC];

  wallets.forEach((w, i) => console.log(`Wallet ${String.fromCharCode(65 + i)} Public:`, w.publicKey));

  // ------------------------
  // 2️⃣ Criar múltiplas transações
  // ------------------------
  const transactions = [
    new Transaction(walletA.publicKey, walletB.publicKey, 100, 'HUB'),
    new Transaction(walletB.publicKey, walletC.publicKey, 50, 'HUB'),
    new Transaction(walletC.publicKey, walletA.publicKey, 25, 'HUB'),
  ];

  // Assinar cada transação com a chave da wallet de origem
  transactions.forEach((tx) => {
    const senderWallet = wallets.find(w => w.publicKey === tx.from);
    const key = ec.keyFromPrivate(senderWallet.privateKey, 'hex');
    tx.signTransaction(key);
    blockchain.addTransaction(tx);
    console.log('✍️ Transação assinada:', tx);
  });

  // ------------------------
  // 3️⃣ Minerar 3 blocos consecutivos
  // ------------------------
  for (let i = 0; i < 3; i++) {
    const miner = wallets[i % wallets.length]; // minerador rotativo
    const block = blockchain.minePendingTransactions(miner.publicKey);
    console.log(`⛏️ Bloco ${block.index} minerado com transações:`, block.transactions);
  }

  // ------------------------
  // 4️⃣ Criar stakes dinâmicos
  // ------------------------
  blockchain.createStake(walletB.publicKey, 50);
  blockchain.createStake(walletC.publicKey, 30);

  console.log('🪙 Stakes criados:', blockchain.stakes);

  // ------------------------
  // 5️⃣ Calcular recompensas simuladas
  // ------------------------
  const simulateRewards = (seconds) => {
    blockchain.stakes.forEach(stake => {
      const rewardRate = 0.05; // 5% por minuto
      const reward = stake.amount * rewardRate * (seconds / 60);
      console.log(`💰 Recompensa estimada para ${stake.wallet.substring(0,10)}... após ${seconds}s: ${reward.toFixed(2)} HUB`);
    });
  };

  simulateRewards(60);
  simulateRewards(120);

  // ------------------------
  // 6️⃣ Validar blockchain
  // ------------------------
  const valid = await blockchain.validateChain();
  console.log('✅ Blockchain válida:', valid);
}

main().catch(err => console.error('❌ Erro na simulação avançada:', err));