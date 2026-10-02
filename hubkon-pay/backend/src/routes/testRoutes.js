const express = require('express');
const authorize = require('../middlewares/authorize');
const router = express.Router();

// Rota protegida de teste
router.get('/secret', authorize('view_secret'), (req, res) => {
  res.status(200).json({ message: 'Você acessou o segredo!' });
});

module.exports = router;
