// src/routes/stakingRoutes.js
import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";
import Wallet from "../models/walletModel.js";
import { claimRewardsController } from "../controllers/stakingController.js";

const router = Router();

// POST /api/staking/claim
router.post("/claim", authorize(), claimRewardsController);

// GET /api/staking/balance/:userId
router.get("/balance/:userId", authorize(), async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    if (!wallet) return res.status(404).json({ message: "Wallet de staking não encontrada" });
    res.json({ balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Erro ao consultar saldo de staking", error: err.message });
  }
});

export default router;