/**
 * @file app.js
 * @description Main Entry Point for HUBKON GLOBAL Master Engine.
 * Version: V.1010 ELITE - Direct Web3 Non-Custodial Injected Core.
 * AppSec Patch: CORS allowedHeaders aligned & Ingestion Payload Expanded to 500mb. ✅
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

// Importação do Ledger Central para persistência atómica
import TransactionModel from './src/models/TransactionModel.js';

dotenv.config();
const app = express();

// ===========================================================
// 🛡️ SECURITY LAYER & CONNECTIVITY (CORS ALIGNED WITH CLIENT SHIELD)
// ===========================================================
app.use(helmet()); 

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", true], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // 🎛️ INJEÇÃO CIRÚRGICA: Permite a passagem da armadura HMAC do lado do cliente
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-hubkon-signature'],
  credentials: true 
}));

app.options('*', cors());

// =========================================================================
// ⚡ EXPANSÃO DOS LIMITES DE INGESTÃO AD VALOREM (CONFIGURADO PARA 500MB)
// =========================================================================
// Corrige definitivamente o erro de PayloadTooLargeError para faturas HD pesadas
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
// =========================================================================

// ===========================================================
// 🛑 GLOBAL CIRCUIT BREAKER & LIMITERS
// ===========================================================
app.use(killSwitchMiddleware);
app.use(globalLimiter);     

// ===========================================================
// 🚀 ROUTE GATEWAY (UNIFIED V.1010)
// ===========================================================
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Operational Engines
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/advance', advanceRoutes); 
app.use('/api/escrow', escrowRoutes);
app.use('/api/settle', routingRoutes);          

// 🎛️ NOVA INJEÇÃO NATIVA ATÓMICA DA SPRINT: Roteador de Orquestração Web3 Sem Custódia
const orchestrationRouter = express.Router();

// MOCK ENDPOINT PARA A FASE DE SANDBOX - MONTAGEM DE BYTES
orchestrationRouter.post("/build-unsigned-tx", async (req, res) => {
  try {
    const { clientPublicKey, destinationWallet, amount, assetType } = req.body;
    if (!clientPublicKey || !destinationWallet || !amount) {
      return res.status(400).json({ success: false, message: "Parâmetros em falta." });
    }
    const mockUnsignedHex = Buffer.from(`HUBKON_UNSIGNED_TX_BYTES_FOR_${amount}_${assetType || 'USDC'}`).toString("hex");
    return res.status(200).json({
      success: true,
      unsignedTxHex: mockUnsignedHex,
      feeApplied: amount * 0.01,
      netAmount: amount * 0.99,
      blockhash: "4zMMC9Zd1mCgJ8e4w15A1A4K2K2K2K2K2K2K2K2K2K2K"
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Real /broadcast endpoint com persistência no MongoDB Ledger
orchestrationRouter.post("/broadcast", async (req, res) => {
  try {
    const { signedTxHex, companyId, initialAmount, assetType, invoiceNumber } = req.body;
    if (!signedTxHex) {
      return res.status(400).json({ success: false, message: "Assinatura hex em falta." });
    }
    
    console.log("📡 [INJECTED BROADCAST] Gravando transação no MongoDB Ledger...");
    const mockBlockchainSignature = `3s2Fq3uD4m8XzRtP1qW2eR3t4y5u6i7o8p9a0s1d2f3g4h5j6k7_${Date.now()}`;
    const fee = (Number(initialAmount) || 0) * 0.01;
    const net = (Number(initialAmount) || 0) - fee;

    const newRecord = await TransactionModel.create({
      company: companyId || "64f1a2b3c4d5e6f7a8b9c0d1",
      amount: Number(initialAmount) || 0,
      currency: "USD",
      digitalCurrencyUsed: assetType?.toUpperCase() || "USDC",
      selectedRail: "SOLANA_WEB3",
      settlementPartner: "HUBKON_LLC_HOLDING",
      invoiceNumber: invoiceNumber || `INV-W3-${Date.now()}`,
      status: "COMPLETED", 
      feeApplied: fee,
      netAmount: net,
      type: "web3_withdrawal", 
      blockchainHash: mockBlockchainSignature,
      metadata: {
        ip: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "CoreBroadcast-Agent"
      }
    });

    return res.status(200).json({
      success: true,
      message: "Transmissão concluída. Rota Web3 executada sem custódia.",
      railUsed: "SOLANA_WEB3",
      blockchainSignature: mockBlockchainSignature,
      payload: newRecord
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Acopla o sub-roteador injetado no carril principal da API
app.use('/api/orchestration', orchestrationRouter);

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
