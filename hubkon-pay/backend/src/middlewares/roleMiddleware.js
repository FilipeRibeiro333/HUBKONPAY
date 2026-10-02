// backend/src/middlewares/roleMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

/**
 * Middleware para autenticação via JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'Token não fornecido' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Usuário inválido' });

    req.user = user; // anexar user ao request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Middleware para verificar role específica
 * Exemplo: admin, superadmin, fiscal
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Usuário não autenticado' });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ error: 'Acesso negado' });
    next();
  };
};