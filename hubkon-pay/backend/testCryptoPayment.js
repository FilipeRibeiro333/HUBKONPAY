// testCryptoPayment.js
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');

console.log('🚀 Iniciando teste de pagamento crypto...');

const { USER_EMAIL, USER_PASSWORD } = process.env;
if (!USER_EMAIL || !USER_PASSWORD) {
  console.error('❌ ERRO: Email e senha são obrigatórios no .env');
  process.exit(1);
}

const KEYS_DIR = path.join(__dirname, 'keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

if (!fs.existsSync(KEYS_DIR)) fs.mkdirSync(KEYS_DIR);

if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey.export({ type: 'pkcs8', format: 'pem' }));
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey.export({ type: 'spki', format: 'pem' }));
  console.log('✅ Chaves de teste geradas automaticamente');
}

let privateKey;
try {
  privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
} catch (err) {
  console.error('❌ ERRO ao ler chave privada:', err.message);
  process.exit(1);
}

function signPayload(payload) {
  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(payload));
  sign.end();
  return sign.sign(privateKey, 'base64');
}

const payload = {
  email: USER_EMAIL,
  password: USER_PASSWORD,
  amount: 100,
  currency: 'USD',
};

const signature = signPayload(payload);
const API_URL = 'http://localhost:5000/api/crypto-payment/test';

(async () => {
  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
      },
    });
    console.log('✅ Resposta da API:', response.data);
  } catch (err) {
    if (err.response) {
      console.error('❌ ERRO DO SERVIDOR:', err.response.data);
    } else {
      console.error('❌ ERRO:', err.message);
    }
  }
})();