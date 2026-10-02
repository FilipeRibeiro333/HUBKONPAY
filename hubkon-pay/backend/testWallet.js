// backend/testWallet.js
const Wallet = require('./src/blockchain/Wallet');

// 🔹 Criar wallets
const walletA = new Wallet('A');
const walletB = new Wallet('B');
const walletC = new Wallet('C');

// 🔹 Saldo inicial
walletA.addBalance('HUB', 100);
walletB.addBalance('HUB', 100);
walletC.addBalance('HUB', 100);

console.log('💰 Saldo inicial:');
console.log(`A: ${walletA.getBalance('HUB')} HUB`);
console.log(`B: ${walletB.getBalance('HUB')} HUB`);
console.log(`C: ${walletC.getBalance('HUB')} HUB\n`);

// 🔹 Fazer stake
walletA.stake('HUB', 20);
walletB.stake('HUB', 30);

console.log('📌 Após stake:');
console.log(`A: Stake ${walletA.getStake('HUB')}, Saldo ${walletA.getBalance('HUB')}`);
console.log(`B: Stake ${walletB.getStake('HUB')}, Saldo ${walletB.getBalance('HUB')}\n`);

// 🔹 Minerar bloco (simulação)
const blockReward = 50;

// Minerador recebe 80%
const minerReward = blockReward * 0.8;
walletC.addBalance('HUB', minerReward);

// Stakers recebem 20% proporcional
const stakeRewardPool = blockReward * 0.2;
const totalStake = walletA.getStake('HUB') + walletB.getStake('HUB');
walletA.rewards += (walletA.getStake('HUB') / totalStake) * stakeRewardPool;
walletB.rewards += (walletB.getStake('HUB') / totalStake) * stakeRewardPool;

console.log('⛏️ Minerado bloco:');
console.log(`C (minerador): ${walletC.getBalance('HUB')} HUB`);
console.log(`A (recompensas pendentes): ${walletA.rewards}`);
console.log(`B (recompensas pendentes): ${walletB.rewards}\n`);

// 🔹 Resgatar recompensas
console.log('🏆 Resgatando recompensas...');
console.log(`A resgatou: ${walletA.claimRewards()} HUB`);
console.log(`B resgatou: ${walletB.claimRewards()} HUB\n`);

// 🔹 Status final
console.log('💰 Status final:');
console.log(`A: Saldo ${walletA.getBalance('HUB')}, Stake ${walletA.getStake('HUB')}`);
console.log(`B: Saldo ${walletB.getBalance('HUB')}, Stake ${walletB.getStake('HUB')}`);
console.log(`C: Saldo ${walletC.getBalance('HUB')}, Stake ${walletC.getStake('HUB')}`);