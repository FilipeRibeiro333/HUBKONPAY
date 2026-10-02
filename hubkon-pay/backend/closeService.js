/**
 * @file closeService.js
 * @description Script de Automação e Despacho de Desalocação On-Chain para a Solana.
smart * Version: V.1027 PRODUCTION MASTER ✅ (Semana 10 Core Automation)
 */

import { executeRentRescue } from "./src/services/rentService.js";
import Escrow from "./src/models/EscrowModel.js";

/**
 * ⚡ GATILHO DE LIQUIDAÇÃO AUTOMÁTICA DE INFRAESTRUTURA
 * @function dispatchAccountClosure
 * @param {String} escrowId - ID do contrato a ser desalocado on-chain
 */
export const dispatchAccountClosure = async (escrowId) => {
    try {
        console.log(`\n🔔 [AUTOMATION GATEWAY] Sinal de liquidação detetado para o Escrow: ${escrowId}`);
        console.log("🔒 [SHIELD] Verificando conformidade regulatória antes de queimar o cofre...");

        // 1️⃣ Dupla Verificação de Segurança (SRO): Garante paridade de dados no MongoDB hubkon_beta
        const escrow = await Escrow.findById(escrowId);
        if (!escrow) {
            console.error(`❌ [AUTOMATION_ERROR] Abortado: Escrow ${escrowId} não existe na base local.`);
            return { success: false, reason: "NOT_FOUND" };
        }

        // Se o contrato ainda estiver pendente, o script de automação aborta para proteger os fundos
        if (escrow.status !== "released" && escrow.status !== "cancelled") {
            console.warn(`⚠️ [SRO WARNING] Tentativa de fecho prematura para o cofre ${escrowId}. Status atual: ${escrow.status}`);
            return { success: false, reason: "ESCROW_STILL_ACTIVE" };
        }

        console.log("🚀 [DISPATCH] Requisitos validados com sucesso! Acionando rentService...");

        // 2️⃣ Invoca o serviço atómico que deriva a PDA e assina a transação com a Solana Web3
        const result = await executeRentRescue(escrowId);

        if (result.success) {
            console.log(`🏆 [AUTOMATION SUCCESS] Ciclo de vida encerrado para o contrato: ${escrowId}`);
            console.log(`🔑 Solana Transaction Proof: ${result.solanaTxHash}`);
        }

        return result;

    } catch (error) {
        console.error(`🚨 [AUTOMATION_CRITICAL_FAULT] Falha crítica no despacho do cofre ${escrowId}:`, error.message);
        return { success: false, error: error.message };
    }
};

// Se o script for chamado diretamente via terminal para uma auditoria manual de emergência:
const args = process.argv.slice(2);
if (args.length > 0) {
    const targetId = args[0];
    console.log(`⚙️ [MANUAL OVERRIDE] Solicitando despacho forçado para o ID: ${targetId}`);
    
    // Import dinâmico do banco apenas para execução isolada via CLI
    import("./src/config/db.js").then(async (db) => {
        await db.default();
        await dispatchAccountClosure(targetId);
        process.exit(0);
    }).catch(err => {
        console.error("Falha no handshake manual do Mongo:", err.message);
        process.exit(1);
    });
}
