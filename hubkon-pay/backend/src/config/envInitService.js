/**
 * @file envInitService.js
 * @description Infrastructure-as-Code Initialization Service for Hubkon Core.
 * Version: V.1101 ELITE - Auto-Deployment Patch.
 */
import NetworkConfig from "../models/NetworkConfigModel.js";

export const initializeNetworkInfrastructure = async () => {
  try {
    const coreRails = ["SOLANA_WEB3", "EVM_BRIDGE", "SWIFT_BANK", "CIPS_CHINA"];
    
    console.log("⚙️ [DEPLOYMENT] A verificar integridade dos carris de liquidação no Ledger...");

    for (const railName of coreRails) {
      // Verifica se o carril já existe no MongoDB
      const exists = await NetworkConfig.findOne({ rail: railName });
      
      if (!exists) {
        // Se a base de dados for nova, injeta o carril ativo por padrão
        await NetworkConfig.create({
          rail: railName,
          isActive: true
        });
        console.log(`✅ [AUTO-DEPLOYMENT] Carril financeiro instalado com sucesso: ${railName}`);
      }
    }
    
    console.log("🚀 [DEPLOYMENT] Todos os carris de infraestrutura estão sincronizados e online.");

  } catch (error) {
    console.error("❌ [DEPLOYMENT CRITICAL] Falha ao inicializar infraestrutura de rede:", error.message);
  }
};
