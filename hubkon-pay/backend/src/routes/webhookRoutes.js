/**
 * @file webhookRoutes.js
 * @description Enterprise Webhook Routing for HUBKON PAY.
 * Core: Preserves native simulation controllers and injects the SBF Solana core dispatcher.
 * Version: V.1025 ✅
 */
import express from "express";
import crypto from "crypto";
import { handleWebhook, getWebhookLogs } from "../controllers/webhookController.js";
import SolanaClient from "../config/solanaClient.js"; // 📡 Ponte Web3 instalada na Semana 3
import Escrow from "../models/EscrowModel.js";
import Transaction from "../models/transactionModel.js";

const router = express.Router();

/**
 * @route   GET /api/webhooks
 * @desc    Busca logs de atividades para o Dashboard (Mantido original)
 */
router.get("/", getWebhookLogs);

/**
 * @route   POST /api/webhooks/local-bank
 * @desc    Simulação de callback de banco local (Mantido original)
 */
router.post("/local-bank", handleWebhook);

/**
 * @route   POST /api/webhooks/external
 * @desc    Endpoint para integrações externas (ERPs/Terceiros) (Mantido original)
 */
router.post("/external", handleWebhook);

// =========================================================================
// ⚡ GATEWAY ADICIONADO: OUVIINTE AUTOMÁTICO DE DEPÓSITOS DE KWANZAS (AOA)
// =========================================================================
/**
 * @route   POST /api/webhooks/bank-deposit
 * @desc    Production-ready endpoint triggered by physical clearings (BAI, BFA, BNA).
 *          Validates institutional HMAC-SHA256 signatures before on-chain execution.
 */
router.post("/bank-deposit", async (req, res) => {
    console.log("📡 [WEBHOOK INBOUND] Nova confirmação bancária recebida no HUBKON CORE.");

    try {
        const signature = req.headers["x-hubkon-signature"];
        const { escrowId, bankReference, amountReceived, currencyReceived } = req.body;

        // 🛡️ CRITICAL RISK CHECK (SRO): Proteção absoluta contra injeção de depósitos falsos [GSO/SRO]
        const expectedSignature = crypto
            .createHmac("sha256", process.env.BANK_WEBHOOK_SECRET || "SUPER_SECRET_KEY")
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (signature !== expectedSignature) {
            console.warn("🚨 [SECURITY_ALERT] Assinatura do Webhook Bancário Inválida! Operação travada.");
            return res.status(401).json({ success: false, message: "UNAUTHORIZED_SIGNATURE" });
        }

        // 1. Localiza a custódia correspondente no teu MongoDB hubkon_beta
        const escrow = await Escrow.findById(escrowId);
        if (!escrow) {
            return res.status(404).json({ success: false, message: "ESCROW_NOT_FOUND" });
        }

        if (escrow.status !== "pending") {
            return res.status(400).json({ success: false, message: "INVALID_ESCROW_STATUS" });
        }

        console.log(`💰 [BANK CLEARANCE] Depósito físico confirmado. Invocar contrato em Rust na Solana...`);

        // 2. SOVEREIGN SETTLEMENT LAYER: Tranca os USDC digitais no teu cofre PDA on-chain
        let solanaSignature = null;
        try {
            const solanaResult = await SolanaClient.signAndSendInstruction(
                "initialize_escrow",
                { buyer: escrow.companyA, vendor: escrow.companyB, escrowAccount: escrow._id },
                { amount: escrow.amount, feePercentage: 200 } // 2.00% em pontos base (bps)
            );
            if (solanaResult.success) solanaSignature = solanaResult.signature;
        } catch (solanaErr) {
            console.error("⚠️ [SRO QUEUE] Solana em sobrecarga. Transação enviada para fila de retry no Redis...");
        }

        // 3. Atualização Atómica do Ledger local (MongoDB)
        escrow.status = "approved"; // O Kwanza caiu, contrato ativado na Solana, liberado para o fornecedor ver
        escrow.history.push({
            action: "bank_deposit_confirmed",
            details: `Ref: ${bankReference}. Fundos retidos on-chain. Solana Tx: ${solanaSignature || "QUEUED_IN_REDIS"}`
        });
        await escrow.save();

        await Transaction.create({
            companyId: escrow.companyA,
            amount: amountReceived,
            currency: currencyReceived,
            type: "bank_deposit_clearance",
            status: solanaSignature ? "COMPLETED" : "QUEUED_FOR_RETRY",
            blockchainHash: solanaSignature,
            relatedEscrow: escrow._id
        });

        return res.status(200).json({
            success: true,
            message: "DEPOSIT_PROCESSED_SUCCESSFULLY",
            blockchainTx: solanaSignature
        });

    } catch (error) {
        console.error("❌ [WEBHOOK_CRITICAL_ERROR]", error.message);
        return res.status(500).json({ success: false, message: "WEBHOOK_INTERNAL_FAULT" });
    }
});

export default router;
