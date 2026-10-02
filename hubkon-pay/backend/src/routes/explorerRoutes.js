import express from 'express';
import Block from '../models/BlockModel.js';
import Transaction from '../models/transactionModel.js'; // 🛠️ CORREÇÃO: Nome unificado do ficheiro do modelo
import User from '../models/UserModel.js';

const router = express.Router();

/* =========================================================
   📦 TODOS OS BLOCOS (Híbrido e Resiliente para o HUBKON Explorer)
   GET /api/explorer/blocks?page=1&limit=10
========================================================= */
router.get('/blocks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1️⃣ Tenta puxar os blocos selados da coleção física do validador
    let total = await Block.countDocuments();
    let blocks = await Block.find()
      .sort({ index: -1 })
      .skip(skip)
      .limit(limit);

    // 2️⃣ SE A TABELA DE BLOCOS ESTIVER VAZIA (Ambiente Sandbox), ADAPTA LENDO AS TRANSAÇÕES WEB3
    if (total === 0) {
      const liveTx = await Transaction.find({
        blockchainHash: { $ne: null }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      total = await Transaction.countDocuments({ blockchainHash: { $ne: null } });
      
      // Mapeia e formata os dados no formato exato que a tabela do teu Frontend espera renderizar
      blocks = liveTx.map((tx, idx) => ({
        _id: tx._id,
        index: total - (skip + idx),
        hash: tx.blockchainHash, // Alinhado perfeitamente com o teu modelo de transações
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        transactions: [tx._id],
        validatorSignature: "HUBKON_VALIDATOR_SIG_" + tx._id,
        validatorId: "HUBKON_VALIDATOR_01",
        timestamp: tx.createdAt
      }));
    }

    res.json({
      totalBlocks: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      blocks
    });

  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar blocos no Ledger híbrido', error: err.message });
  }
});

/* =========================================================
   🔎 BLOCO POR INDEX
========================================================= */
router.get('/block/:index', async (req, res) => {
  try {
    const block = await Block.findOne({ index: req.params.index });

    if (!block) {
      // Procura adaptativa no ledger de transações caso não exista bloco físico
      const allTx = await Transaction.find({ blockchainHash: { $ne: null } }).sort({ createdAt: 1 });
      const targetIndex = parseInt(req.params.index) - 1;

      if (targetIndex >= 0 && targetIndex < allTx.length) {
        const tx = allTx[targetIndex];
        return res.json({
          index: req.params.index,
          hash: tx.blockchainHash,
          previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
          transactions: [tx._id],
          validatorSignature: "HUBKON_VALIDATOR_SIG_" + tx._id,
          validatorId: "HUBKON_VALIDATOR_01",
          timestamp: tx.createdAt
        });
      }
      return res.status(404).json({ message: 'Bloco ou transação indexada não encontrada' });
    }

    res.json(block);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar bloco por índice', error: err.message });
  }
});

/* =========================================================
   🔗 BLOCO POR HASH
========================================================= */
router.get('/hash/:hash', async (req, res) => {
  try {
    let block = await Block.findOne({ hash: req.params.hash });

    if (!block) {
      // Fallback para procurar a assinatura diretamente no histórico de transações do backend
      const tx = await Transaction.findOne({ blockchainHash: req.params.hash });
      if (!tx) {
        return res.status(404).json({ message: 'Hash criptográfico não localizado no sistema' });
      }
      
      block = {
        hash: tx.blockchainHash,
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        transactions: [tx._id],
        validatorSignature: "HUBKON_VALIDATOR_SIG_" + tx._id,
        validatorId: "HUBKON_VALIDATOR_01",
        timestamp: tx.createdAt
      };
    }

    res.json(block);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar hash no Ledger', error: err.message });
  }
});

/* =========================================================
   💳 TODAS AS TRANSAÇÕES (com paginação)
========================================================= */
router.get('/transactions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Transaction.countDocuments();

    const transactions = await Transaction.find()
      .populate('from', 'email')
      .populate('to', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      totalTransactions: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      transactions
    });

  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar transações', error: err.message });
  }
});

/* =========================================================
   🧾 TRANSAÇÃO POR ID
========================================================= */
router.get('/transaction/:id', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id)
      .populate('from', 'email')
      .populate('to', 'email');

    if (!tx) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    res.json(tx);

  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar transação', error: err.message });
  }
});

/* =========================================================
   👛 WALLET (saldo + histórico)
========================================================= */
router.get('/wallet/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const transactions = await Transaction.find({
      $or: [
        { from: user._id },
        { to: user._id },
        { company: user.company }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      email: user.email,
      balance: user.balance || 0,
      totalTransactions: transactions.length,
      transactions
    });

  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar wallet', error: err.message });
  }
});

export default router;
