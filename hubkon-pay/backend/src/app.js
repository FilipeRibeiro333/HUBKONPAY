/**
 * @file app.js
 * @description Main Entry Point for HUBKON GLOBAL Master Engine.
 * Version: V.1009 ELITE - Optimized Unified Gateway with Non-Custodial Multi-Rail Patch.
 */

import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet'; 
import cors from 'cors';
import swaggerUi from 'swagger-ui-express'; 

// Configurations and Security
import { swaggerSpec } from './src/config/swaggerConfig.js'; 
import { globalLimiter } from './src/middlewares/rateLimiter.js';
import errorHandler from './src/middlewares/errorHandler.js'; 

// 🛡️ EMERGENCY CONTROL
import { killSwitchMiddleware } from './src/middlewares/killSwitch.js';

// Route Engines (SaaS & Finance)
import routingRoutes from './src/routes/routing.js';
import authRoutes from './src/routes/authRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import blockchainRoutes from './src/routes/blockchainRoute.js';
import escrowRoutes from './src/routes/escrowRoutes.js';
import advanceRoutes from './src/routes/advanceRoutes.js'; 

// 🎛️ NOVA INJEÇÃO DA SPRINT: Importa o teu router expandido com a Camada Web3 Não-Custodial e Off-Ramp
import orchestrationRoutes from './src/routes/orchestrationRoutes.js';

dotenv.config();
const app = express();

// ===========================================================
// 🛡️ SECURITY LAYER & CONNECTIVITY
// ===========================================================
app.use(helmet()); 

app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true 
}));

app.options('*', cors());
app.use(express.json());

// ===========================================================
// 🛑 GLOBAL CIRCUIT BREAKER & LIMITERS
// ===========================================================
app.use(killSwitchMiddleware);
app.use(globalLimiter);     
// ===========================================================
// 🚀 ROUTE GATEWAY (UNIFIED V.1009)
// ===========================================================

/**
 * ⚡ HARMONIZED AUTH GATEWAY
 * Unified mapping to prevent 404s. 
 * 'authRoutes' now handles both legacy and API-prefixed calls.
 * IMPORTANT: 'signupRoute' was removed to prevent route hijacking.
 */
app.use('/api/auth', authRoutes); // Official: http://localhost:5000/api/auth/register
app.use('/auth', authRoutes);     // Legacy: http://localhost:5000/auth/register

// Operational Engines
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/advance', advanceRoutes); 
app.use('/api/escrow', escrowRoutes);

// 🎛️ ATIVAÇÃO DOS MOTORES DUAL-ENGINE: Liga as rotas de faturas e saques diretos à blockchain
app.use('/api/settle', routingRoutes);          // Ativa o teu routingController real original
app.use('/api/orchestration', orchestrationRoutes); // Ativa o teu web3OrchestrationController expandido

// Documentation & Monitoring
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => res.json({ 
  status: "💚 HUBKON API OPERATIONAL", 
  timestamp: new Date() 
}));

app.get('/', (req, res) => res.json({ message: '🚀 HUBKON GLOBAL SYSTEM ONLINE' }));

// ===========================================================
// 🚨 GLOBAL ERROR HANDLER
// ===========================================================
app.use(errorHandler);

export default app;
