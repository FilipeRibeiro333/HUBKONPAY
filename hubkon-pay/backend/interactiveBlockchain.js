// interactiveBlockchain.js
const readline = require('readline-sync');
const { Blockchain } = require('./src/blockchain/blockchain');
const { Wallet } = require('./src/blockchain/wallet');
const { Transaction } = require('./src/blockchain/transaction');

// Inicializa blockchain e wallets
const chain = new Blockchain();
const wallets = [
  new Wallet('Wallet A'),
  new Wallet('Wallet B'),
  new Wallet('Wallet C')
];

const HUB_TOKEN = 'HUB';
const MINING_REWARD = 50;

function showWallets() {
  console.log('\n💰 Status das wallets:');
  wallets.forEach((w, i) => {
    console.log(`${i}: ${w.name} - Saldo HUB: ${w.balance}, Stake: ${w.stake}, Recompensas: ${w.rewards.toFixed(2)}`);
  });
}

function createTransaction() {
  showWallets();
  const fromIndex = readline.questionInt('Escolha a wallet remetente: ');
  const toIndex = readline.questionInt('Escolha a wallet destinatário: ');
  const amount = readline.questionFloat('Digite o valor da transação: ');

  const fromWallet = wallets[fromIndex];
  const toWallet = wallets[toIndex];

  if (fromWallet.balance < amount) {
    console.log('❌ Saldo insuficiente!');
    return;
  }

  const tx = new Transaction(fromWallet.publicKey, toWallet.publicKey, amount, HUB_TOKEN);
  tx.signTransaction(fromWallet.key);
  chain.addTransaction(tx);

  fromWallet.balance -= amount;
  console.log('✅ Transação criada com sucesso');
}

function mineBlock() {
  showWallets();
  const minerIndex = readline.questionInt('Escolha a wallet que minerará o bloco: ');
  const minerWallet = wallets[minerIndex];

  chain.minePendingTransactions(minerWallet.publicKey, wallets);

  // Atualiza saldo do minerador
  minerWallet.balance += MINING_REWARD;
  console.log(`✅ Bloco minerado! Minerador e stakers receberam recompensas`);
}

function createStake() {
  showWallets();
  const walletIndex = readline.questionInt('Escolha a wallet que fará stake: ');
  const amount = readline.questionFloat('Digite o valor do stake: ');

  const wallet = wallets[walletIndex];
  if (wallet.balance < amount) {
    console.log('❌ Saldo insuficiente para stake!');
    return;
  }

  wallet.balance -= amount;
  wallet.stake += amount;
  console.log('✅ Stake criado com sucesso');
}

function claimRewards() {
  showWallets();
  wallets.forEach(wallet => {
    if (wallet.rewards > 0) {
      wallet.balance += wallet.rewards;
      console.log(`${wallet.name} resgatou ${wallet.rewards.toFixed(2)} HUB`);
      wallet.rewards = 0;
    }
  });
}

function viewBlockchain() {
  console.log('\n4️⃣ Blockchain atual:');
  console.log(JSON.stringify(chain.chain, null, 2));
}

// Menu interativo
while (true) {
  console.log('\n===== HUBKON Blockchain Interactive =====');
  console.log('1. Criar transação');
  console.log('2. Minerar bloco');
  console.log('3. Criar stake');
  console.log('4. Consultar / Resgatar recompensas');
  console.log('5. Visualizar blockchain');
  console.log('0. Sair');

  const choice = readline.questionInt('Escolha uma opção: ');

  switch (choice) {
    case 1:
      createTransaction();
      break;
    case 2:
      mineBlock();
      break;
    case 3:
      createStake();
      break;
    case 4:
      claimRewards();
      break;
    case 5:
      viewBlockchain();
      break;
    case 0:
      console.log('Saindo...');
      process.exit(0);
    default:
      console.log('Opção inválida');
  }
}