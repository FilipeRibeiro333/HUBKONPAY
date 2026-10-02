// src/routes/checkoutRoutes.js
import express from "express";
import { createCheckoutSession } from "../controllers/checkoutController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔒 Auth required
router.post("/session", authMiddleware, createCheckoutSession);

export default router;