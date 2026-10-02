// backend/src/middlewares/rbacMiddleware.js

function can(requiredRole) {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: 'Erro interno de RBAC' });
    }
  };
}

module.exports = {
  can,
};
