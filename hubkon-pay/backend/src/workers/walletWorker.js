import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import crypto from 'crypto';
import Wallet from '../models/WalletModel.js';
import ApiKey from '../models/ApiKeyModel.js';
import dotenv from 'dotenv';
dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

new Worker('walletQueue', async job => {
  const { companyId } = job.data;

  console.log("🔹 Processando Wallet e ApiKey para Company:", companyId);

  const walletAddress = crypto.randomBytes(20).toString('hex');
  await Wallet.create({ companyId, address: walletAddress });
  console.log("✅ Wallet criada:", walletAddress);

  const apiKeyValue = "hk_live_" + crypto.randomBytes(24).toString('hex');
  await ApiKey.create({ companyId, key: apiKeyValue });
  console.log("✅ ApiKey criada:", apiKeyValue);

}, { connection });