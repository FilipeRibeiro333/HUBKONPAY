import { Router } from "express";
import { 
    getUsers, 
    createUser, 
    createCompany, 
    getCompanies, // ✅ Adicionado: Importação da nova função
    updateSetting, 
    getSettings, 
    getAdminDashboardStats, 
    approveMultisigTransaction, 
    revokeSuspiciousTransaction, 
    getRiskAudit, 
    toggleKillSwitch 
} from "../controllers/adminController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { checkPlanAccess } from "../middlewares/planMiddleware.js"; 

const router = Router();

/**
 * HUBKON ADMIN ENGINE - INSTITUTIONAL ROUTES
 */

// --- 1. IDENTITY & BUSINESS PROVISIONING ---
router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.post("/users", authMiddleware, adminMiddleware, createUser);

// ✅ NOVA ROTA: Lista todas as 6 unidades registradas no Banco Master
router.get("/companies", authMiddleware, adminMiddleware, getCompanies); 
router.post("/companies", authMiddleware, adminMiddleware, createCompany);

// --- 2. GLOBAL SETTINGS (GOVERNANÇA MASTER) ---
router.get("/settings", authMiddleware, getSettings); 
router.put("/settings", authMiddleware, adminMiddleware, updateSetting);

// --- 3. FINANCIAL GOVERNANCE (RISK CONTROL) ---
router.get("/risk-audit", authMiddleware, adminMiddleware, checkPlanAccess('enterprise'), getRiskAudit);
router.post("/transactions/approve", authMiddleware, adminMiddleware, checkPlanAccess('enterprise'), approveMultisigTransaction);
router.post("/transactions/revoke", authMiddleware, adminMiddleware, checkPlanAccess('enterprise'), revokeSuspiciousTransaction);

// --- 4. EMERGENCY LOCKDOWN (KILL SWITCH) ---
router.post("/system/toggle-kill", authMiddleware, adminMiddleware, checkPlanAccess('enterprise'), toggleKillSwitch);

// --- 5. ANALYTICS & MONITORING ---
router.get("/dashboard/stats", authMiddleware, adminMiddleware, checkPlanAccess('pro'), getAdminDashboardStats);

export default router;
