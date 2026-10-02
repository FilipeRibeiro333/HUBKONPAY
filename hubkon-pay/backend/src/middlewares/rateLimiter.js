import rateLimit from 'express-rate-limit';

/**
 * 🔒 HUBKON FINANCIAL ARMORED SHIELD
 * Proteção de alto nível para operações sensíveis e movimentação de capital.
 */

// 1. 🛡️ LOGIN LIMITER (Proteção contra Brute Force)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Apenas 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas tentativas de login. Acesso bloqueado por 15 minutos."
  }
});

// 2. 💰 SENSITIVE OPERATIONS LIMITER (O Guarda do Lucro Turbo)
// Protege: Antecipação, Staking Claim e Transferências.
export const sensitiveOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Janela de 1 hora
  max: 10, // Apenas 10 operações críticas por hora por IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    // 🚨 LOG DE ALERTA: Isto avisa-te no terminal se alguém estiver a abusar do teu dinheiro
    console.error(`⚠️ [ALERTA DE SEGURANÇA] Atividade suspeita em operação financeira! IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
  message: {
    success: false,
    message: "Atividade financeira excessiva detectada. Operação bloqueada por segurança. Contacte o suporte Hubkon."
  }
});

// 3. 🌍 GLOBAL API LIMITER (Proteção contra DDoS geral)
export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 200, // 200 pedidos por IP
  message: {
    success: false,
    message: "O tráfego do seu IP excedeu os limites de segurança da API Hubkon."
  }
});
