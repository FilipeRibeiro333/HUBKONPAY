// src/middlewares/verifyRole.js
const verifyRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user?.role; // assumindo que verifyJWT adiciona req.user
    if (!userRole || userRole !== role) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
  };
};

module.exports = verifyRole;
