import { Blockchain } from './src/blockchain/blockchain.js';
import { Wallet } from './src/blockchain/wallet.js';
import { Transaction } from './src/blockchain/transaction.js';

const chain = new Blockchain();

const walletA = new Wallet('Wallet A');
const walletB = new Wallet('Wallet B');
const walletC = new Wallet('Wallet C');

function showStatus() {
  console.log('\n💰 Status das wallets:');
  [walletA, walletB, walletC].forEach(w => {
    console.log(`${w.name} - Saldo: ${w.getBalance()}, Stake: ${w.getStake()}, Recompensas: ${w.rewards.toFixed(2)}`);
  });
}

console.log('🚀 Iniciando Blockchain HUBKON...');

// Criar transações
const tx1 = new Transaction(walletA.publicKey, walletB.publicKey, 20, 'HUB');
tx1.signTransaction(walletA.keyPair);
chain.addTransaction(tx1);

const tx2 = new Transaction(walletB.publicKey, walletC.publicKey, 15, 'HUB');
tx2.signTransaction(walletB.keyPair);
chain.addTransaction(tx2);

showStatus();

// Minerar blocos
chain.minePendingTransactions(walletC);
showStatus();

// Resgatar recompensas
[walletA, walletB, walletC].forEach(w => {
  if (w.rewards > 0) {
    w.addBalance(w.rewards);
    console.log(`${w.name} resgatou ${w.rewards.toFixed(2)} HUB`);
    w.rewards = 0;
  }
});

showStatus();

console.log('\n📜 Blockchain completa:');
console.log(JSON.stringify(chain.getChain(), null, 2));