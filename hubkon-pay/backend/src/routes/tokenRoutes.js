import express from 'express';
import { authenticate, authorizeRole } from '../middlewares/authMiddleware.js';
import User from '../models/UserModel.js';
import Transaction from '../models/TransactionModel.js';

const router = express.Router();

/* ===================== MINT ===================== */
router.post('/mint', authenticate, authorizeRole('superadmin', 'admin'), async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    user.balance += amount;
    await user.save();

    await Transaction.create({
      from: null,
      to: user._id,
      amount,
      type: 'mint'
    });

    res.json({
      message: `Mint realizado: ${amount} tokens para ${user.email}`,
      balance: user.balance
    });

  } catch (err) {
    res.status(500).json({ message: 'Erro no mint', error: err.message });
  }
});

/* ===================== BURN ===================== */
router.post('/burn', authenticate, authorizeRole('superadmin', 'admin'), async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Saldo insuficiente para burn' });
    }

    user.balance -= amount;
    await user.save();

    await Transaction.create({
      from: user._id,
      to: null,
      amount,
      type: 'burn'
    });

    res.json({
      message: `Burn realizado: ${amount} tokens removidos`,
      balance: user.balance
    });

  } catch (err) {
    res.status(500).json({ message: 'Erro no burn', error: err.message });
  }
});

/* ===================== TRANSFER ===================== */
router.post('/transfer', authenticate, async (req, res) => {
  const { fromId, toId, amount } = req.body;

  if (!fromId || !toId || !amount) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }

  try {
    const fromUser = await User.findById(fromId);
    const toUser = await User.findById(toId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: 'Usuário(s) não encontrado(s)' });
    }

    if (fromUser.balance < amount) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    fromUser.balance -= amount;
    toUser.balance += amount;

    await fromUser.save();
    await toUser.save();

    await Transaction.create({
      from: fromUser._id,
      to: toUser._id,
      amount,
      type: 'transfer'
    });

    res.json({
      message: `Transferência realizada: ${amount} tokens`
    });

  } catch (err) {
    res.status(500).json({ message: 'Erro na transferência', error: err.message });
  }
});

/* ===================== BALANCE ===================== */
router.get('/balance/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({ email: user.email, balance: user.balance });

  } catch (err) {
    res.status(500).json({ message: 'Erro ao consultar saldo', error: err.message });
  }
});

/* ===================== HISTÓRICO ===================== */
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('from', 'email')
      .populate('to', 'email')
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar transações', error: err.message });
  }
});

export default router;