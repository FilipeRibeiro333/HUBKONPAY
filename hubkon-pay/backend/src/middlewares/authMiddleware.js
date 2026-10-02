/**
 * @file authMiddleware.js
 * @description Identity Verification & Real-Time Plan Sync (SaaS Shield).
 * Version: V.1032 ELITE ✅ (Resiliente para SuperAdmin)
 */
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Company from "../models/companyModel.js";

export const authMiddleware = async (req, res, next) => {
    try {
        // 1. Extração Segura do Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Acesso negado. Credenciais ausentes." });
        }

        const token = authHeader.split(" ")[1];

        // 2. Validação Criptográfica
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Busca do Utilizador
        const user = await User.findById(decoded.id || decoded.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilizador não encontrado no Ledger." });
        }

        // 4. ⚡ LOGICA RBAC: Busca de Empresa Condicional
        let company = null;
        if (user.companyId) {
            company = await Company.findById(user.companyId);
        }

        // 5. Injeção de Contexto Global Rico
        // Se for superadmin, garantimos plano enterprise e ignoramos a falta de empresa
        req.user = {
            id: user._id,
            role: user.role,
            companyId: user.companyId || null,
            plan: user.role === 'superadmin' ? 'enterprise' : (company?.plan || "basic"),
            subscriptionStatus: user.role === 'superadmin' ? 'active' : (company?.subscriptionStatus || "inactive")
        };

        console.log(`🛡️ [AUTH] Acesso: ${user.role} | Plano: ${req.user.plan}`);
        next();
    } catch (err) {
        const message = err.name === "TokenExpiredError" ? "SESSION_EXPIRED" : "INVALID_TOKEN";
        return res.status(401).json({ success: false, message: message });
    }
};
