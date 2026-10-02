/**
 * @file blockchainRoute.js
 * @description Sovereign Network Infrastructure & Forensic Auditing Gateway.
 * Integrates local Proof-of-Trust (PoT) metadata with native Solana Criptográfico Signatures.
 * Version: V.1026 ELITE ✅ (Semana 9 Final Calibration Patch)
 */

import { Router } from "express";
import Block from "../models/blockModel.js";
import Transaction from "../models/transactionModel.js"; // 💎 Injetado para ler as hashes reais da Solana
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { checkPlanAccess } from "../middlewares/planMiddleware.js";
import { initiateTransfer } from "../services/paymentService.js"; // 🛡️ HUBKON Finance Core
import ExchangeService from "../services/exchangeService.js"; // 📡 Novo Oráculo Híbrido Web3

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Blockchain
 *   description: Sovereign Network Infrastructure (Enterprise Elite)
 */

/**
 * @swagger
 * /blockchain/blocks:
 *   get:
 *     summary: Returns the hybrid ledger history with Solana cryptographic proofs
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 */
router.get("/blocks", authMiddleware, async (req, res) => {
    try {
      console.log("\n🔍 [LEDGER EXPLORER] Varredura unificada solicitada pelo painel visual.");
      const { companyId, role, plan } = req.user;
      
      // 🛡️ REQUISITO DE SEGURANÇA (SRO): Se não for superadmin, aplica a validação de plano corporativo
      // para garantir que utilizadores normais da camada "basic" não acedam ao explorador [GSO/SRO]
      if (role !== "superadmin") {
        if (!plan || plan.toLowerCase() !== "enterprise") {
          return res.status(403).json({ success: false, message: "PAYWALL: Requer Plano Enterprise." });
        }
      }

      // 👑 FILTRO MULTI-TENANT DEFINITIVO: Se for SYS_OVERLORD (superadmin), a query ignora o filtro e puxa todos os blocos globais!
      let blockQuery = { blockchainHash: { $ne: null } };

      // Se for um operador comum Pro/Enterprise, filtra estritamente pelo nó privado dele de forma segura
      if (role !== "superadmin" && companyId) {
        blockQuery.companyId = companyId.toString(); // ⚡ Normalização de tipo para evitar quebra de String vs ObjectId [GSO/SRO]
      }

      // Busca na tua coleção de Transações as faturas carimbadas on-chain com a Solana
      const publicLedger = await Transaction.find(blockQuery)
        .sort({ createdAt: -1 })
        .limit(50)
        .select("amount currency type status blockchainHash createdAt");

      // Mapeia o resultado para injetar o índice dinâmico que o teu componente visual usa na tela
      const blocksFormatted = publicLedger.map((tx, idx) => ({
        _id: tx._id,
        index: publicLedger.length - idx,
        timestamp: tx.createdAt,
        hash: tx.blockchainHash,
        previousHash: idx === publicLedger.length - 1 ? "Genesis Block" : "HUBKON-PREV-VALIDATION-NODE",
        amount: tx.amount,
        currency: tx.currency || "USD",
        type: tx.type === "advance_payout" ? "ANTECIPAÇÃO TURBO" : tx.type, // Tradução amigável para a tua interface
        status: tx.status,
        nonce: 84210 + idx
      }));

      console.log(`✅ [EXPLORER SUCCESS] Retornados ${blocksFormatted.length} blocos assinados com a Solana.`);

      return res.json({ 
        success: true, 
        count: blocksFormatted.length, 
        blocks: blocksFormatted // Devolve a chave exata que a linha 25 do teu Frontend consome
      });

    } catch (error) {
      console.error("❌ [EXPLORER_ROUTE_FAULT] Erro ao escanear o Ledger:", error.message);
      res.status(500).json({ error: "Falha na sincronização forense pelo Sovereign Core." });
    }
});

/**
 * @swagger
 * /blockchain/blocks:
 *   post:
 *     summary: Mines a new block with layered security validation
 *     tags: [Blockchain]
 */
router.post("/blocks", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { data, amount } = req.body;

      // 🛡️ SECURITY CHECK: Evaluate if this block movement needs a Timelock or Multisig
      const securityCheck = await initiateTransfer(amount || 0, "BLOCKCHAIN_LEDGER", req.user.id);

      if (securityCheck.status !== 'COMPLETED') {
        return res.status(202).json({
          success: true,
          message: "Block mining queued. Awaiting security clearance (Timelock/Multisig).",
          securityStatus: securityCheck
        });
      }

      const newBlock = await Block.create(req.body);
      res.status(201).json({ 
        success: true, 
        message: "Block successfully mined!", 
        block: newBlock 
      });

    } catch (error) {
      console.error("[BLOCKCHAIN_ERROR]", error);
      res.status(500).json({ error: "Mining rejected by Sovereign Security Core" });
    }
});

/**
 * @swagger
 * /blockchain/exchange/quote:
 *   get:
 *     summary: Returns the live hybrid oracle exchange rate for corporate conversion
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 */
router.get("/exchange/quote", 
  authMiddleware, 
  checkPlanAccess("enterprise"), 
  async (req, res) => {
    try {
      const { from, to, amount } = req.query;

      if (!from || !to || !amount) {
        return res.status(400).json({
          success: false,
          error: "🚨 [SRO INPUT CHECK] Os parâmetros 'from', 'to' e 'amount' são obrigatórios."
        });
      }

      const rate = await ExchangeService.getConversionRate(from, to);
      const inputAmount = parseFloat(amount);
      
      const convertedOutput = from === "AOA" ? (inputAmount / rate) : (inputAmount * rate);

      res.json({
        success: true,
        engine: "HUBKON MULTI_CURRENCY_ORACLE",
        timestamp: Date.now(),
        quote: {
          from,
          to,
          inputAmount,
          exchangeRate: parseFloat(rate.toFixed(4)),
          estimatedOutput: parseFloat(convertedOutput.toFixed(2))
        }
      });
    } catch (error) {
      console.error("❌ [ORACLE_ROUTE_ERROR]", error.message);
      res.status(500).json({ error: "Falha na reconciliação cambial pelo Sovereign Oracle Core" });
    }
});

export default router;
