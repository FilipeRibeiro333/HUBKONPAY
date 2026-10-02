/**
 * @file escrowController.js
 * @description Smart Escrow & Payout Orchestration Controller.
 * Cleaned and polished for seamless production terminal metrics (Semana 13).
 * Version: V.1047 PRODUCTION MASTER ✅ (Parte 1)
 */
import mongoose from "mongoose";
import { 
    createEscrow, 
    approveEscrow, 
    releaseEscrow, 
    fulfillCondition, 
    requestAdvancePayment 
} from "../services/escrowService.js";

import { generateAuditCertificate } from "../services/pdfService.js"; 
import Block from "../models/blockModel.js";
import Escrow from "../models/EscrowModel.js";
import Audit from "../models/Audit.js"; 

/**
 * 🚀 MOTOR DE ANTECIPAÇÃO DE LIQUIDEZ (FACTORING B2B)
 * @function requestAdvanceController
 */
export const requestAdvanceController = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user?.companyId;

        if (!companyId && req.user?.role !== 'superadmin') {
            throw new Error("SESSÃO_INVÁLIDA: Nó de empresa ausente.");
        }

        // ✅ LOG CRÍTICO DE AUDITORIA (SRO): Mantido para rastreabilidade institucional
        console.log(`🚀 [TURBO ENGINE] Ordem de factoring autorizada para o Escrow: ${id}`);

        const result = await requestAdvancePayment(id, companyId, req.user);

        res.json({
            success: true,
            message: "🚀 TURBO ADVANCE EXECUTADO: Liquidez master sincronizada!",
            data: result
        });
    } catch (error) {
        console.error("❌ [ADVANCE ERROR]:", error.message);
        const isPaywall = error.message.includes("PAYWALL_BLOCK");
        res.status(isPaywall ? 403 : 400).json({ 
            success: false, 
            error_code: isPaywall ? "PAYWALL_BLOCK" : "PROTOCOL_ERROR",
            message: error.message 
        });
    }
};

/**
 * 📜 GERADOR DE CERTIFICADOS FORENSES (PDF BLOCKCHAIN LINK)
 * @function getAuditCertificateController
 */
export const getAuditCertificateController = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const isMaster = user.role === 'superadmin';
        if (user.plan !== 'enterprise' && !isMaster) {
            return res.status(403).json({
                success: false,
                error_code: "PAYWALL_BLOCK",
                message: "Certificados de Auditoria são exclusivos para o nível ENTERPRISE."
            });
        }

        const escrow = await Escrow.findById(id).populate("companyA companyB");
        if (!escrow) return res.status(404).json({ success: false, message: "Contrato não encontrado." });

        const auditLogs = await Audit.find({ 
            $or: [ { invoiceId: id }, { "details.escrowId": id } ] 
        }).sort({ timestamp: 1 });

        const block = await Block.findOne({ "transactions.escrowId": new mongoose.Types.ObjectId(id) });
        if (!block) throw new Error("BLOQUEIO_PENDENTE: O contrato ainda não foi minerado no Ledger.");

        const certificate = generateAuditCertificate(block, escrow, auditLogs);

        res.json({ success: true, certificate });
    } catch (error) {
        console.error("🚨 [AUDIT ERROR]:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};
/**
 * @function releaseEscrowController
 * @description Executa a liquidação final aplicando a taxa master de 1.5% ao SuperAdmin/Inquilino.
 */
export const releaseEscrowController = async (req, res) => {
    try {
        const result = await releaseEscrow(req.params.id, req.user);
        res.json({ success: true, message: "Liquidação Concluída!", ...result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @function createEscrowController
 * @description Inicializa o protocolo de custódia limpando as aspas de strings indesejadas.
 */
export const createEscrowController = async (req, res) => {
    try {
        let { companyB, amount, conditions = [] } = req.body;
        const companyA = req.user?.companyId;

        if (typeof companyB === 'string') {
            companyB = companyB.trim().replace(/['"]+/g, '');
        }

        const escrow = await createEscrow({
            companyA,
            companyB,
            amount: amount || 5000,
            conditions: conditions.length > 0 ? conditions : [{ description: "Settlement Milestone", type: "milestone", status: "pending" }],
            createdBy: req.user?.id,
        });

        res.json({ success: true, message: "Protocolo Gerado!", escrow });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @function approveEscrowController
 * @description Regista o consentimento bilateral crítico no Ledger.
 */
export const approveEscrowController = async (req, res) => {
    try {
        const escrow = await approveEscrow(req.params.id, req.user);
        res.json({ success: true, message: "Aprovação Registrada!", escrow });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @function fulfillConditionController
 * @description Altera e valida o estado de cumprimento dos marcos (Proof of Delivery).
 */
export const fulfillConditionController = async (req, res) => {
    try {
        const escrow = await fulfillCondition(req.params.id, req.body.index, req.user);
        res.json({ success: true, escrow });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
