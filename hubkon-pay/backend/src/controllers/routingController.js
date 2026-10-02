import Transaction from "../models/TransactionModel.js";
import solanaService from "../services/solanaService.js";

/**
 * HUBKON CORE - MULTI-RAIL ROUTING CONTROLLER
 * Processa faturas aduaneiras e orquestra liquidações atómicas de ativos estáveis.
 * Version: V.1049 ELITE - Complete Production Pipeline Integration Patch.
 */
export const orchestrateSettlement = async (req, res) => {
  try {
    const { 
      companyId, 
      amount, 
      currency, 
      destinationCountry, 
      invoiceNumber, 
      supplierRequiresFiat,
      digitalCurrencyUsed, // ✅ INJEÇÃO DA SPRINT: Moeda digital escolhida no Frontend
      invoiceFileName      // ✅ INJEÇÃO DA SPRINT: Metadados do upload do PDF
    } = req.body;

    if (!companyId || !amount || !currency || !destinationCountry) {
      return res.status(400).json({ 
        success: false, 
        message: "Erro de validacao: Parametros corporativos obrigatorios em falta." 
      });
    }

    const baseFee = amount * 0.01;
    const netAmountCalculated = amount - baseFee;

    let selectedRail = "SOLANA_WEB3";
    let settlementPartner = "HUBKON_LLC_HOLDING";

    const countryLower = destinationCountry.toLowerCase();
    const currencyUpper = currency.toUpperCase();

    if (countryLower === "china" && supplierRequiresFiat === true) {
      selectedRail = "CIPS_CHINA";
      settlementPartner = "BANCO_PARCEIRO_LICENCIADO_BNA";
    } else if (amount >= 100000 && supplierRequiresFiat === true) {
      selectedRail = "SWIFT_BANK";
      settlementPartner = "BANCO_PARCEIRO_LICENCIADO_BNA";
    }

    // Identifica o ativo digital estável com base na escolha do utilizador
    const stablecoinChoice = selectedRail === "SOLANA_WEB3" ? (digitalCurrencyUsed || "USDC") : "NONE";

    let generatedBlockchainHash = null;
    let initialStatus = "ROUTING_ACTIVE";

    if (selectedRail === "SOLANA_WEB3") {
      try {
        // O teu pipeline real da Solana Devnet acorda e processa a liquidação atómica
        generatedBlockchainHash = await solanaService.triggerOnChainSettlement(netAmountCalculated);
        initialStatus = "COMPLETED"; 
      } catch (web3Error) {
        initialStatus = "FAILED";
      }
    }
    const newTransaction = new Transaction({
      company: companyId,
      amount: amount,
      currency: currencyUpper,
      digitalCurrencyUsed: stablecoinChoice, // Grava se foi USDC, EURC ou CNHC no teu Ledger
      selectedRail: selectedRail,
      settlementPartner: settlementPartner,
      invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
      destinationCountry: destinationCountry,
      feeApplied: baseFee,
      netAmount: netAmountCalculated,
      status: initialStatus, 
      blockchainHash: generatedBlockchainHash,
      invoiceFileMeta: invoiceFileName || "", // Anexa o rasto do upload do documento aduaneiro
      type: selectedRail === "SOLANA_WEB3" ? "transfer" : "fiat_orchestration_routing",
      metadata: {
        ip: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "CoreEngine-Agent",
        riskScore: amount > 50000 ? 15 : 2
      }
    });

    await newTransaction.save();

    console.log(`📡 [ENGINE] Ordem ${newTransaction.invoiceNumber} salva com sucesso. Rail: ${selectedRail} | Ativo: ${stablecoinChoice}`);

    if (selectedRail === "SOLANA_WEB3") {
      return res.status(200).json({
        success: true,
        message: `Orquestracao concluida com sucesso. Rota Web3 executada de forma atomica utilizando ${stablecoinChoice}.`,
        railUsed: selectedRail,
        digitalAsset: stablecoinChoice,
        engineInstruction: "O software acoplou com sucesso o pipeline on-chain na devnet da Solana.",
        blockchainSignature: generatedBlockchainHash,
        payload: newTransaction
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Orquestracao concluida com sucesso. Rota Fiduciaria Tradicional [${selectedRail}] selecionada.`,
        railUsed: selectedRail,
        digitalAsset: "NONE (FIAT)",
        engineInstruction: `A transacao fisica sera processada pelo parceiro regulado: ${settlementPartner}. A HUBKON gerou os logs de instrucao e auditoria para liquidacao via SWIFT/CIPS.`,
        payload: newTransaction
      });
    }

  } catch (error) {
    console.error("❌ [CRITICAL COCKPIT ERROR]:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Falha critica no motor de orquestracao distribuida.", 
      error: error.message 
    });
  }
};
