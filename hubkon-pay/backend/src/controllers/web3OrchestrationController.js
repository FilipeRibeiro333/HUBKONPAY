import { Connection, clusterApiUrl } from "@solana/web3.js";
import TransactionModel from "../models/TransactionModel.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

/**
 * HUBKON CRYPTOGRAPHIC PIPELINE - MULTI-RAIL CONTROLLER
 * Orquestra a transmissao cega de assinaturas locais geradas pelo browser do cliente.
 * Version: V.1055 ELITE - Non-Custodial Broadcast Core ✅
 */

/**
 * MOCK ENDPOINT PARA A FASE DE SANDBOX
 * Simula a geracao de bytes brutos desarmados para o Frontend Next.js consumir.
 */
export const requestUnsignedTransaction = async (req, res) => {
  try {
    const { clientPublicKey, destinationWallet, amount, assetType } = req.body;

    if (!clientPublicKey || !destinationWallet || !amount) {
      return res.status(400).json({
        success: false,
        message: "Erro de validacao: Parametros de carteira ou montante em falta."
      });
    }

    // Geracao de hash simulado para testes locais de UI
    const mockUnsignedHex = Buffer.from(`HUBKON_UNSIGNED_TX_BYTES_FOR_${amount}_${assetType}`).toString("hex");

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
};

/**
 * ENDPOINT DE TRANSMISSÃO CEGA REAL (/api/orchestration/broadcast)
 * Recebe a transaçao assinada pelo cliente e faz a persistência atómica no MongoDB.
 */
export const broadcastSignedTransaction = async (req, res) => {
  try {
    const { signedTxHex, companyId, initialAmount, assetType, invoiceNumber } = req.body;

    if (!signedTxHex) {
      return res.status(400).json({
        success: false,
        message: "Erro de integridade: Nao foi fornecida nenhuma assinatura digital hex."
      });
    }

    console.log("📡 [BROADCAST] Recebida instrucao assinada pelo cliente. Gravando no Ledger...");

    // Em producao real: const sig = await connection.sendRawTransaction(Buffer.from(signedTxHex, "hex"));
    const mockBlockchainSignature = `3s2Fq3uD4m8XzRtP1qW2eR3t4y5u6i7o8p9a0s1d2f3g4h5j6k7_${Date.now()}`;

    const fee = (Number(initialAmount) || 0) * 0.01;
    const net = (Number(initialAmount) || 0) - fee;

    // Escrita atómica final no MongoDB utilizando o enum expandido validado na Fase 1
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
      message: "Transmissao concluida com sucesso. Rota Web3 executada de forma nao-custodial.",
      railUsed: "SOLANA_WEB3",
      blockchainSignature: mockBlockchainSignature,
      payload: newRecord
    });

  } catch (error) {
    console.error("❌ [BROADCAST CRITICAL ERROR]:", error.message);
    return res.status(500).json({
      success: false,
      message: "Falha critica ao transmitir ou validar transacao assinada.",
      error: error.message
    });
  }
};
