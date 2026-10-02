/**
 * @file authRoutes.js
 * @description Authentication & Identity Provisioning Gateway for HUBKON PAY.
 * Version: V.1020 ELITE ✅
 */
import { Router } from "express";
import { loginLimiter } from "../middlewares/rateLimiter.js";
import { signupCompany } from "../controllers/signupCompanyController.js";
import { loginUser, getMe } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Log de diagnóstico para o terminal do backend
console.log("🚀 [SYSTEM] AuthRoutes Engine Loaded: Endpoints /register & /login are now ACTIVE.");

/**
 * 🔹 Registro (SaaS Onboarding)
 * Rota unificada para criação de Empresa, Dono e Carteira.
 * 
 * ✅ CORREÇÃO: Passamos o controller diretamente para que o Express 
 * injete corretamente os parâmetros (req, res, next). Isso elimina o 
 * erro "next is not a function" durante falhas de validação.
 */
router.post("/register", loginLimiter, signupCompany);

/**
 * 🔹 Login
 * Protegido por Rate Limiting para evitar ataques de força bruta.
 */
router.post("/login", loginLimiter, loginUser);

/**
 * 🔹 Perfil do Utilizador (Protegido)
 * Requer Token JWT válido para aceder ao contexto do terminal.
 */
router.get("/me", authMiddleware, getMe);

export default router;
