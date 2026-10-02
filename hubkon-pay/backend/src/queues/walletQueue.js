// walletQueue.js
// ---------------------------------------------
// BullMQ queue for asynchronous wallet creation
// - Ensures heavy operations run in background
// - Prevents blocking main signup route
// ---------------------------------------------

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
export const walletQueue = new Queue('walletQueue', { connection });