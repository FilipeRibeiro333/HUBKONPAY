const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/email', verifyToken, (req, res) => {
  const { to, subject, text } = req.body;
  if (!to || !subject || !text) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  res.json({ message: 'E-mail simulado enviado', to, subject, text });
});

module.exports = router;
