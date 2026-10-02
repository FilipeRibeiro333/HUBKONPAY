// src/middlewares/securityMiddleware.js
import ApiKey from '../models/apiKeyModel.js';

const securityMiddleware = async (req, res, next) => {
  try {
    // Rotas que não exigem JWT
    const publicPaths = ['/health', '/api/auth/login', '/api/auth/register'];
    if (publicPaths.includes(req.path)) return next();

    // Verifica headers
    const requiredHeaders = ['x-api-key', 'authorization'];
    const missingHeaders = requiredHeaders.filter((h) => !req.headers[h]);

    // Debug log
    console.log('[DEBUG] Headers recebidos:', req.headers);
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        message: 'Headers obrigatórios ausentes',
        missing: missingHeaders,
      });
    }

    // Checa API Key no banco
    const apiKey = await ApiKey.findOne({ key: req.headers['x-api-key'] }).lean();
    if (!apiKey) {
      console.log('[DEBUG] API Key inválida:', req.headers['x-api-key']);
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Se tudo ok, continua
    next();
  } catch (err) {
    console.error('[DEBUG] Erro no securityMiddleware:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export default securityMiddleware;