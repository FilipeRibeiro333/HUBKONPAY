/**
 * @file redisClient.js
 * @description High-Performance Caching Layer for HUBKON PAY.
 * Implements Redis to store frequently accessed data and session states.
 * 
 * @dev Frontier Hackathon Context:
 * In a B2B ecosystem, speed is critical. Redis reduces MongoDB latency for 
 * real-time balance checks, rate limiting, and temporary escrow states.
 */

import Redis from "ioredis";

/**
 * REDIS CLIENT CONFIGURATION
 * Optimized for low-latency memory storage.
 */
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  /**
   * RECONNECTION STRATEGY
   * Ensures the system remains resilient if the cache node restarts.
   */
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

/**
 * EVENT LISTENERS
 * Monitoring the health of the caching infrastructure.
 */
redis.on("connect", () => {
  console.log("✅ [CACHE] Redis connection established successfully.");
});

redis.on("error", (err) => {
  console.error("❌ [CACHE] Redis critical connection error:", err.message);
});

/**
 * @notice Default export for global application caching (e.g., API Rate Limiting).
 */
export default redis;
