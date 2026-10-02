/**
 * @file killSwitch.js
 * @description Global Emergency Circuit Breaker for HUBKON PAY.
 * Features: OPTIONS bypass for CORS stability and Fail-Open resilience.
 */
import redis from "../config/redisClient.js"; // Your high-performance ioredis instance

/**
 * KILL SWITCH MIDDLEWARE
 * Checks the 'HUBKON_KILL_SWITCH' key in Redis before any business logic.
 */
export const killSwitchMiddleware = async (req, res, next) => {
  /**
   * ⚡ CRITICAL FIX: PREFLIGHT BYPASS
   * Browsers send an OPTIONS request before any POST/PUT to verify CORS.
   * If we block OPTIONS, the real request never happens.
   */
  if (req.method === "OPTIONS") return next();

  try {
    // 1. Query the emergency state from Redis
    const isKilled = await redis.get('HUBKON_KILL_SWITCH');

    // 2. If 'true', halt the request with a Service Unavailable status
    if (isKilled === 'true') {
      return res.status(503).json({ 
        status: "🛑 HUBKON_SYSTEM_PAUSED",
        message: "Institutional maintenance in progress. All services are temporarily suspended.",
        timestamp: new Date().toISOString()
      });
    }

    // 3. System is operational, proceed to the next middleware or route
    next();
  } catch (err) {
    /**
     * RESILIENCE STRATEGY: Fail Open
     * If Redis is down, we log the error but allow traffic to flow 
     * to prevent a complete system outage due to cache failure.
     */
    console.error('[CRITICAL] Kill Switch Layer Error:', err.message);
    next();
  }
};
