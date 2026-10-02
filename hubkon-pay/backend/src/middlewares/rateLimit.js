import rateLimit from 'express-rate-limit';

/**
 * 🔒 LOGIN BRUTE-FORCE SHIELD
 * Proteção crítica para a entrada do sistema.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos de "castigo"
  max: 5, // Apenas 5 tentativas falhadas
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas de login. O sistema Hubkon bloqueou este acesso por 15 minutos por segurança.'
  },
  // 🏎️ Adicionamos um handler para log de auditoria
  handler: (req, res, next, options) => {
    console.warn(`⚠️ [SECURITY] Tentativa de invasão detectada no IP: ${req.ip}`);
    res.status(429).send(options.message);
  }
});
