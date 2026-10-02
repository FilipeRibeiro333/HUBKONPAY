import express from "express";
import { Blockchain } from "../blockchain/blockchain.js";

const router = express.Router();
const chain = new Blockchain();

// Endpoint para ver a blockchain completa
router.get("/blocks", async (req, res) => {
  const blocks = await chain.getChain();
  res.json(blocks);
});

// Endpoint para minerar um bloco simples
router.post("/mine", async (req, res) => {
  const { minerEmail, transactions } = req.body;
  try {
    const block = await chain.addBlock(transactions, minerEmail);
    res.json(block);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;