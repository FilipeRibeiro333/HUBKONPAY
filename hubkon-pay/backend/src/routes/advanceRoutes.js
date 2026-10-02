/**
 * ⚡ ADVANCE PAYMENT ROUTES (FACTORING)
 * -------------------------------------
 * Permite que vendedores antecipem o recebimento do Escrow.
 * Exclusivo para clientes PRO ou ENTERPRISE.
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkPlanAccess } from "../middlewares/planMiddleware.js"; // O teu gater
import { requestAdvancePayment } from "../services/advanceService.js";

const router = Router();

/**
 * @desc Request early payout for an approved escrow
 * @access Private (Company B / Seller) - Minimum Plan: PRO
 */
router.post("/request", 
  authMiddleware, 
  checkPlanAccess("pro"), // 🔒 BARREIRA DE PLANO: Bloqueia o plano Basic
  async (req, res) => {
    try {
      const { escrowId } = req.body;
      const companyId = req.user.companyId;

      // 🚀 Chama o serviço que tem a regra de 10X e a Taxa de 5%
      const result = await requestAdvancePayment(escrowId, companyId);

      res.json({
        success: true,
        message: "Antecipação realizada com sucesso! O lucro turbo foi registrado.",
        data: result
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;
