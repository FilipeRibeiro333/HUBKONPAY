const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: 'Missing userId or amount' });
  res.status(201).json({ message: 'Pagamento criado com sucesso', payment: { userId, amount, id: '12345' } });
});

module.exports = router;
