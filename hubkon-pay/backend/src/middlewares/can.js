const can = (role) => {
  return (req, res, next) => {
    // 1. Proteção contra o erro "next is not a function"
    if (typeof next !== 'function') {
      console.error("Erro Crítico: 'next' não foi passado para o middleware 'can'");
      return;
    }

    // 2. Se não houver usuário logado (caso do Onboarding/Cadastro), 
    // liberamos a passagem para que a empresa possa ser criada.
    if (!req.user) {
      return next();
    }

    // 3. Regra de Ouro: SuperAdmin sempre tem acesso a tudo
    if (req.user.role === 'superadmin' || req.user.isSuperAdmin) {
      return next();
    }

    // 4. Verificação normal de permissão para usuários comuns
    if (req.user.role === role) {
      return next();
    }

    return res.status(403).json({ message: 'Acesso negado: Permissão insuficiente' });
  };
};

module.exports = can;
