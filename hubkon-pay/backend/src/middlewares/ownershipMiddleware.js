/**
 * @file ownershipMiddleware.js
 * @description Refactored Multi-Tenant & RBAC Boundary Guard for HUBKON PAY.
 * Validates resource ownership for both individual users and corporate company tenants.
 * Version: V.1025 ✅
 */

import Escrow from "../models/EscrowModel.js";

export const checkOwnership = async (req, res, next) => {
  try {
    const { role, _id, companyId } = req.user; // Extrai a empresa do utilizador autenticado
    const { id: resourceId, escrowId } = req.params;

    // 1️⃣ REGRA INTERNA: Superadmin e Admin têm livre trânsito para auditoria geral do SRO
    if (role === "admin" || role === "superadmin") {
      return next();
    }

    // 2️⃣ REGRA B2C (Perfil Individual): O utilizador só acede ao seu próprio ID de conta
    if (resourceId && _id.toString() === resourceId) {
      return next();
    }

    // 3️⃣ REGRA B2B MULTI-TENANT (Fiel Depósito & Antecipações) [GSO/SRO]
    // Se a rota estiver a aceder a um Escrow, valida as fronteiras empresariais
    const targetEscrowId = escrowId || resourceId;
    
    if (targetEscrowId && mongoose.Types.ObjectId.isValid(targetEscrowId)) {
      const escrow = await Escrow.findById(targetEscrowId);
      
      if (escrow) {
        if (!companyId) {
          return res.status(403).json({
            success: false,
            message: "TENANT_ERROR: Acesso negado. A tua conta não está vinculada a nenhuma empresa."
          });
        }

        const isBuyer = String(escrow.companyA) === String(companyId);
        const isVendor = String(escrow.companyB) === String(companyId);

        // 🛡️ A BARREIRA DE AÇO: Se não for o comprador nem o vendedor, barra o acesso imediatamente [GSO/SRO]
        if (!isBuyer && !isVendor) {
          console.warn(`🚨 [SECURITY_BREACH_ATTEMPT] User ${_id} from Company ${companyId} tried to hijack Escrow ${targetEscrowId}`);
          return res.status(403).json({
            success: false,
            message: "ACCESS_DENIED: Esta operação financeira pertence a outro tenant corporativo."
          });
        }
        
        req.tenantId = companyId; // Carimba o ID do tenant seguro para buscas automáticas
        return next();
      }
    }

    // Fallback de segurança caso o recurso não seja mapeado
    if (resourceId && _id.toString() !== resourceId) {
      return res.status(403).json({ success: false, message: "Acesso negado: Recurso restrito." });
    }

    next();
  } catch (error) {
    console.error("❌ [OWNERSHIP_MIDDLEWARE_CRITICAL_FAULT]", error);
    return res.status(500).json({ success: false, message: "INTERNAL_SECURITY_GUARD_ERROR" });
  }
};