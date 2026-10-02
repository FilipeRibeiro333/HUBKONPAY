/**
 * HUBKON PAY - UNIFIED SECURITY SHIELD
 * Combines Network Protection (Helmet, CORS, Rate Limit) with Fintech Logic (Kill Switch).
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Redis = require('ioredis'); // Required to connect to your WSL2 Redis

/**
 * REDIS INSTANCE CONFIGURATION
 * Connects to the redis-server running on your Ubuntu terminal.
 */
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => console.error('🚨 HUBKON Security: Redis connection failed', err));
redis.on('connect', () => console.log('✅ HUBKON Security: Connected to WSL2 Redis'));

/**
 * 1. HTTP HEADER PROTECTION
 */
const helmetMiddleware = helmet();

/**
 * 2. GLOBAL RATE LIMITER
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. HUBKON infrastructure protection active.' },
});

/**
 * 3. AUTHENTICATION BRUTE-FORCE PROTECTION
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: { error: 'Security Alert: Too many login attempts. Access temporarily locked.' },
});

/**
 * 4. DYNAMIC CORS POLICY
 */
const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.HUBKON_DASHBOARD_URL
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[SECURITY] Blocked CORS request from origin: ${origin}`);
      callback(new Error('CORS Policy: Access Denied'));
    }
  },
  credentials: true,
});

/**
 * 5. HUBKON SMART SHIELD (The "Kill Switch")
 * Core business logic to freeze the system if an attack is detected.
 */
async function securityShield(req, res, next) {
  try {
    // Check the "Panic Button" status in your Ubuntu Redis
    const isSystemPaused = await redis.get('HUBKON_KILL_SWITCH'); 
    
    if (isSystemPaused === 'true') {
      return res.status(503).json({
        error: "System Paused",
        message: "Financial operations are temporarily suspended for security audits."
      });
    }

    next();
  } catch (error) {
    // Fail-Safe: If Redis is down, we fail "closed" to protect assets
    console.error("[CRITICAL] Security Shield Error:", error);
    res.status(500).json({ error: "Internal Security Error - Infrastructure Offline" });
  }
}

module.exports = {
  helmetMiddleware,
  globalLimiter,
  authLimiter,
  corsMiddleware,
  securityShield 
};
