/**
 * @file escrowRoutes.js
 * @description API Routing for the Smart Escrow & Payout Engine.
 * @version V.1060 ELITE ✅ (Critical RBAC Isolation & Shielding)
 */
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkOwnership } from "../middlewares/ownershipMiddleware.js"; // 🛡️ Injetado para proteção de nós individuais
import { 
    createEscrowController, 
    approveEscrowController, 
    fulfillConditionController, 
    releaseEscrowController, 
    getAuditCertificateController,
    requestAdvanceController 
} from "../controllers/escrowController.js";
import Escrow from "../models/EscrowModel.js";

const router = Router();

/**
 * @route GET /api/escrow/my-contracts
 * @desc Sincronização SOBERANA: Isolamento total entre SuperAdmin e Clientes.
 */
router.get("/my-contracts", authMiddleware, async (req, res) => {
    try {
        const { companyId, role } = req.user;
        let query = {};

        const userRole = String(role).toLowerCase().trim();

        if (userRole === 'superadmin') {
            query = {}; 
            console.log("👑 [GOVERNANÇA] Auditoria Global autorizada para SuperAdmin.");
        } 
        else if (companyId) {
            query = { $or: [{ companyA: companyId }, { companyB: companyId }] };
            console.log(`🏢 [NÓ PRIVADO] Acesso filtrado para a organization: ${companyId}`);
        } 
        else {
            console.warn(`🚨 [TENTATIVA_INVASAO] Utilizador "${userRole}" tentou acesso sem permissão.`);
            return res.status(403).json({ 
                success: false, 
                message: "ACESSO_NEGADO: O seu perfil não possui permissão de governança global." 
            });
        }

        const escrows = await Escrow.find(query)
            .sort({ createdAt: -1 })
            .populate("companyA companyB", "name plan");

        res.json({ 
            success: true, 
            count: escrows.length, 
            access_level: userRole,
            escrows 
        });

    } catch (error) {
        console.error("🚨 [LEDGER SYNC FAILURE]:", error.message);
        res.status(500).json({ success: false, message: "Falha na sincronização segura do Ledger." });
    }
});

/**
 * @route POST /api/escrow/create
 * @desc Inicializa novo protocolo de custódia.
 */
router.post("/create", authMiddleware, createEscrowController);

/**
 * @route POST /api/escrow/approve/:id
 * @desc Registro de consentimento bilateral criptográfico.
 */
router.post("/approve/:id", authMiddleware, checkOwnership, approveEscrowController);

/**
 * 🚀 ATO 4: TURBO ADVANCE (ANTECIPAÇÃO)
 * @route POST /api/escrow/advance/:id
 */
router.post("/advance/:id", authMiddleware, checkOwnership, requestAdvanceController);

/**
 * 📜 ATO 4: AUDIT CERTIFICATE (PDF)
 * @route GET /api/escrow/certificate/:id
 */
router.get("/certificate/:id", authMiddleware, checkOwnership, getAuditCertificateController);

/**
 * @route POST /api/escrow/fulfill/:id
 * @desc Validação de Milestone (Proof of Delivery).
 */
router.post("/fulfill/:id", authMiddleware, checkOwnership, fulfillConditionController);

/**
 * @route POST /api/escrow/release/:id
 * @desc Execução de Settlement financeiro final (Botão de Envio).
 */
router.post("/release/:id", authMiddleware, checkOwnership, releaseEscrowController);

export default router;
