// auditPayments.js
const fs = require('fs');
const path = require('path');

console.log('🔎 Iniciando auditoria de pagamentos...');

const backendDir = path.join(__dirname, 'src');
const envFile = path.join(__dirname, '.env');

const paymentKeywords = [
  'stripe', 'payment', 'crypto', 'coinbase', 'bitpay', 'nowpayments', 'multicaixa', 'unitel'
];

// Função para buscar arquivos contendo palavras-chave
function scanFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanFiles(fullPath));
    } else if (stat.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
      for (const keyword of paymentKeywords) {
        if (content.includes(keyword)) {
          results.push({ file: fullPath, keyword });
        }
      }
    }
  });
  return results;
}

// Verifica variáveis de ambiente importantes
function checkEnv() {
  if (!fs.existsSync(envFile)) return [];
  const envContent = fs.readFileSync(envFile, 'utf8').toLowerCase();
  const envKeywords = ['stripe_secret_key', 'stripe_publishable_key', 'crypto', 'coinbase', 'bitpay'];
  return envKeywords.filter(k => envContent.includes(k));
}

// Executando auditoria
const filesFound = scanFiles(backendDir);
const envFound = checkEnv();

console.log('------------------------------');
console.log('📂 Arquivos relacionados a pagamentos encontrados:');
if (filesFound.length === 0) console.log('❌ Nenhum arquivo encontrado');
else filesFound.forEach(f => console.log(`✅ ${f.file} -> contém "${f.keyword}"`));

console.log('------------------------------');
console.log('🛠️ Variáveis de ambiente relacionadas encontradas:');
if (envFound.length === 0) console.log('❌ Nenhuma variável relevante encontrada');
else envFound.forEach(v => console.log(`✅ ${v}`));

console.log('------------------------------');
console.log('💡 Auditoria completa! Agora você sabe o que já existe no projeto.');