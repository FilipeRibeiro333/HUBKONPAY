/**
 * @file creditScoreService.js
 * @description Predictive Risk Engine & Dynamic B2B Credit Scoring for HUBKON.
 * Analyzes transaction historical data in MongoDB to optimize discount factoring rates.
 * Version: V.1027 PRODUCTION MASTER ✅ (Parte 1)
 */

import Escrow from "../models/EscrowModel.js";
import Transaction from "../models/transactionModel.js";

// 🎚️ MATRIZ DE PESOS DO ALGORITMO PREDICTIVO (SRO RISK CORE)
const SCORE_WEIGHTS = {
    SUCCESSFUL_SETTLEMENTS: 0.40, // Peso de 40%: Histórico de fundos liberados com sucesso
    TRANSACTION_VOLUME: 0.30,     // Peso de 30%: Volume financeiro movimentado na plataforma
    DISPUTE_REJECTION_RATE: 0.30  // Peso de 30%: Ausência de travas de risco ou alertas multi-sig
};

/**
 * @function calculateCompanyCreditScore
 * @description Varre o Ledger local, avalia o comportamento do inquilino e emite a nota de 0 a 100.
 * @param {String} companyId - ID da empresa a ser auditada pelo motor de IA
 */
export const calculateCompanyCreditScore = async (companyId) => {
    try {
        console.log(`\n🧠 [RISK_AI] A iniciar análise de crédito preditiva para o Tenant: ${companyId}`);
        
        if (!companyId) {
            console.warn("⚠️ [RISK_AI WARNING] ID da empresa ausente. Retornando score padrão de segurança.");
            return { score: 50, tier: "STANDARD", recommendedFee: 1.5 };
        }

        // 1️⃣ Busca todo o histórico de custódias desta empresa no MongoDB hubkon_beta
        const userEscrows = await Escrow.find({
            $or: [{ companyA: companyId }, { companyB: companyId }]
        });

        // Se a empresa for nova e não tiver histórico, ela começa com nota de confiança básica (Sandbox Friendly)
        if (userEscrows.length === 0) {
            console.log("🌱 [RISK_AI] Empresa nova detectada. Inicializando com score base neutro.");
            return { score: 65, tier: "BRONZE", recommendedFee: 1.5, totalAnalyzed: 0 };
        }

        // 2️⃣ MÁQUINA DE ESTADOS: Extrai os indicadores de performance comportamental
        const totalContracts = userEscrows.length;
        const releasedContracts = userEscrows.filter(e => e.status === "released" || e.status === "completed").length;
        const pendingContracts = userEscrows.filter(e => e.status === "pending" || e.status === "approved").length;
        
        // Calcula o volume financeiro acumulado para premiar grandes movimentadores
        const totalVolume = userEscrows.reduce((sum, e) => sum + (e.amount || 0), 0);

        // 3️⃣ CÁCULO DOS SUB-SCORES MATEMÁTICOS
        // Sub-Score A: Taxa de Sucesso de Entrega e Liquidação (0 a 100)
        const settlementRate = (releasedContracts / totalContracts) * 100;

        // Sub-Score B: Volume Financeiro Escalável (Teto calibrado em $500,000 para pontuação máxima)
        const volumeScore = Math.min((totalVolume / 500000) * 100, 100);

        // Sub-Score C: Fator de Estabilidade (Penaliza contratos que ficaram retidos em risco crítico)
        // Se a empresa possui muitos contratos travados ou suspeitos, a nota de risco despenca
        const activeRiskEscrows = userEscrows.filter(e => e.amount >= 50000 && e.status === "pending").length;
        const stabilityRate = Math.max(100 - (activeRiskEscrows * 20), 0);
        // 4️⃣ CÁLCULO PONDERADO FINAL DO CREDIT SCORE (MATRIZ SRO)
        const finalScore = Math.round(
            (settlementRate * SCORE_WEIGHTS.SUCCESSFUL_SETTLEMENTS) +
            (volumeScore * SCORE_WEIGHTS.TRANSACTION_VOLUME) +
            (stabilityRate * SCORE_WEIGHTS.DISPUTE_REJECTION_RATE)
        );

        // 5️⃣ CLASSIFICAÇÃO CORPORATIVA E AJUSTE DINÂMICO DE TAXAS
        let tier = "BRONZE";
        let recommendedFee = 1.5; // Taxa padrão da HUBKON para faturas normais

        if (finalScore >= 85) {
            tier = "DIAMOND_ELITE";
            recommendedFee = 0.8; // Taxa VIP reduzida para mitigar risco e atrair grandes multinacionais
        } else if (finalScore >= 70) {
            tier = "GOLD_PREMIUM";
            recommendedFee = 1.2; // Taxa intermédia para parceiros consolidados
        } else if (finalScore >= 50) {
            tier = "SILVER_STANDARD";
            recommendedFee = 1.4;
        }

        console.log(`💎 [RISK_AI SUCCESS] Análise Concluída! Score: ${finalScore} | Tier: ${tier} | Taxa Proposta: ${recommendedFee}%`);

        return {
            success: true,
            score: finalScore,
            tier: tier,
            recommendedFee: recommendedFee,
            metrics: {
                totalContracts,
                releasedContracts,
                totalVolumeUSD: totalVolume,
                stabilityIndex: stabilityRate
            }
        };

    } catch (error) {
        console.error("🚨 [CREDIT_SCORE_FAULT] Falha crítica no processamento do motor de IA:", error.message);
        // Fallback protetor para garantir resiliência da infraestrutura se houver erro de consulta
        return {
            success: false,
            score: 60,
            tier: "SILVER_FALLBACK",
            recommendedFee: 1.5,
            error: error.message
        };
    }
};
