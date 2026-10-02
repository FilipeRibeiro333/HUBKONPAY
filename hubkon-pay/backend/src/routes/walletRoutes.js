// src/routes/walletRoutes.js
import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import Wallet from "../models/walletModel.js";

const router = Router();

// GET /api/wallet/:userId → retorna saldo
router.get("/:userId", authorize(), async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) return res.status(404).json({ message: "Wallet não encontrada" });
    res.json({ balance: wallet.balance, currency: wallet.currency });
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar wallet", error: err.message });
  }
});

export default router;