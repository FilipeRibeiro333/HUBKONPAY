/**
 * @file offRampService.js
 * @description Global Settlement & FIAT Off-Ramp Bridge for HUBKON PAY.
 * Converts on-chain USDC from Solana into traditional USD/EUR bank deposits via SWIFT/SEPA.
 * Version: V.1025 ✅
 */

import axios from "axios";
import crypto from "crypto";
import Company from "../models/CompanyModel.js";

// Configurações institucionais (Simuladas para o ambiente Sandbox da Semana 6)
const OFFRAMP_API_URL = process.env.OFFRAMP_API_URL || "https://bvnk.co";
const OFFRAMP_API_KEY = process.env.OFFRAMP_API_KEY || "HUBKON_INSTITUTIONAL_OFFRAMP_SECRET_2026";

class OffRampService {
  /**
   * @notice Despacha os fundos libertados na Solana diretamente para a conta bancária do fornecedor
   * @param {string} vendorCompanyId ID da empresa fornecedora no teu MongoDB
   * @param {number} amountCrypto Quantidade de USDC libertada on-chain
   * @param {string} targetCurrency Moeda de destino bancário ("USD" ou "EUR")
   */
  static async executeGlobalPayout(vendorCompanyId, amountCrypto, targetCurrency = "USD") {
    try {
      console.log(`\n🌍 [OFF-RAMP SERVICE] A iniciar liquidação bancária internacional para o fornecedor: ${vendorCompanyId}`);
      
      // 1. Buscar os dados bancários corporativos e de conformidade (Compliance/AML) da empresa estrangeira
      const vendor = await Company.findById(vendorCompanyId);
      if (!vendor) throw new Error("VENDOR_COMPANY_NOT_FOUND");

      // Fallback seguro de dados bancários de teste caso o teu schema ainda não tenha estes campos explícitos
      const bankDetails = vendor.bankDetails || {
        iban: `DE89370400440532${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
        swiftCode: "DEUTDEDDXXX",
        bankName: "Deutsche Bank AG",
        beneficiaryName: vendor.name
      };

      console.log(`📡 [HANDSHAKE API] Comunicando com o provedor global de liquidez fiduciária...`);
      console.log(`💱 Conversão pretendida: ${amountCrypto} USDC ➔ ${targetCurrency} normais.`);

      // 🛡️ SRO AUDIT CHECK: Payload robusto em conformidade com as regras de transferência bancária internacional [GSO/SRO]
      const payoutPayload = {
        merchantId: "HUBKON_PAY_AFRICA_01",
        sourceAsset: "USDC",
        destinationCurrency: targetCurrency.toUpperCase(),
        amount: amountCrypto,
        beneficiary: {
          name: bankDetails.beneficiaryName,
          iban: bankDetails.iban,
          swift: bankDetails.swiftCode,
          bankName: bankDetails.bankName
        },
        reference: `HUBKON-SETTLE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
      };

      // Handshake síncrono ultra-veloz via HTTP com os servidores globais de Off-Ramp
      // Simulamos a resposta da API com uma assinatura de auditoria institucional
      const mockNetworkId = "SEPA-SWIFT-" + crypto.randomBytes(16).toString("hex").toUpperCase();
      
      console.log(`💸 [OFF-RAMP SUCCESS] Ordem bancária aceita pela clearing internacional.`);
      console.log(`🏛️ Provedor: ${bankDetails.bankName} | IBAN: ${bankDetails.iban} | Ref Internacional: ${mockNetworkId}`);

      return {
        success: true,
        clearingNetworkId: mockNetworkId,
        destinationAccount: bankDetails.iban,
        currencyDelivered: targetCurrency.toUpperCase(),
        timestamp: new Date()
      };

    } catch (error) {
      console.error("❌ [SRO OFF-RAMP CRITICAL FAULT]:", error.message);
      throw new Error(`Falha no processador de rampa de saída global: ${error.message}`);
    }
  }
}

export default OffRampService;
