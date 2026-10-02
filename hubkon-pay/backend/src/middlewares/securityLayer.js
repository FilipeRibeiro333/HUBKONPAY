const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

// ---------------- RATE LIMIT ----------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------- CORS ----------------
const corsOptions = {
  origin: "*", // pode restringir depois
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// ❌ REMOVIDO:
// function apiKeyCheck(...) { ... }

module.exports = {
  helmet,
  corsOptions,
  apiLimiter,
};