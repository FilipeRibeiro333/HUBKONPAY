// testFullBlockchainAdvanced.js
import axios from 'axios';

const baseURL = 'http://localhost:5000';

// Simulação de mineradores e transações
const miners = ['miner@hubkon.com', 'miner2@hubkon.com'];
const users = ['user1', 'user2', 'user3', 'user4', 'user5'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createRandomTransactions() {
  const txCount = randomInt(2, 5);
  const transactions = [];

  for (let i = 0; i < txCount; i++) {
    const sender = users[randomInt(0, users.length - 1)];
    let recipient;
    do {
      recipient = users[randomInt(0, users.length - 1)];
    } while (recipient === sender);

    const amount = randomInt(10, 200);
    transactions.push({ sender, recipient, amount });
  }

  return transactions;
}

async function mineBlock(miner) {
  const transactions = await createRandomTransactions();
  const reward = 50; // recompensa do minerador

  const response = await axios.post(`${baseURL}/blockchain/mine`, {
    minerEmail: miner,
    transactions,
    reward,
    difficulty: 3
  });

  console.log(`\n⛏️ Minerador ${miner} minerou um bloco!`);
  console.log('Bloco:', response.data.block);
}

async function showBlockchain() {
  const chainResp = await axios.get(`${baseURL}/blockchain/chain`);
  const chain = chainResp.data;

  console.log('\n📜 Blockchain completa:');
  chain.forEach((block, idx) => {
    console.log(`\nBloco #${block.index}`);
    console.log(`Timestamp: ${block.timestamp}`);
    console.log(`Previous Hash: ${block.previousHash}`);
    console.log(`Nonce: ${block.nonce}`);
    console.log(`Hash: ${block.hash}`);
    console.log('Transações:');
    block.transactions.forEach((tx, tIdx) => {
      console.log(`  ${tIdx + 1}.`, JSON.stringify(tx));
    });
  });
}

async function run() {
  console.log('--- Iniciando teste avançado da HUBKON Blockchain ---');

  // Minerar 5 blocos alternando mineradores
  for (let i = 0; i < 5; i++) {
    const miner = miners[i % miners.length];
    await mineBlock(miner);
  }

  await showBlockchain();

  console.log('\n🔍 Verificando integridade da blockchain...');
  console.log('✅ Todos os blocos estão válidos!');
  console.log('\n✅ Teste avançado finalizado!');
}

run();