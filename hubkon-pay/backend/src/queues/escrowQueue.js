/**
 * @file escrowQueue.js
 * @description Background Job Queue for Escrow & Settlement Operations.
 * Implements BullMQ with Redis to manage high-volume asynchronous tasks.
 * 
 * @dev Frontier Hackathon Context:
 * "Architectural Resilience". This queue ensures that blockchain interactions 
 * and complex financial settlements are processed without blocking the main 
 * event loop, preventing system timeouts during network congestion.
 */

import { Queue } from "bullmq";

/**
 * ESCROW QUEUE INITIALIZATION
 * Connects to the Redis infrastructure for persistent job management.
 */
const escrowQueue = new Queue("escrowQueue", {
  connection: {
    /** 
     * REDIS CONNECTION CONFIGURATION:
     * In a production environment, these are managed via environment variables.
     */
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
  }
});

/**
 * @notice Exporting the queue instance to be used by controllers for 
 * offloading tasks like 'processPayout' or 'signSBT'.
 */
export default escrowQueue;
