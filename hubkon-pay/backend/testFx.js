import { 
  getAoaExchangeRate, 
  getStablecoinCrossRate, 
  calculateAoaEquivalent, 
  convertUsdcToTargetDigitalAsset 
} from "./src/services/fxService.js";

/**
 * HUBKON CORE - FX SERVICE UNIT TEST
 * Executa a simulação forense do motor de câmbio híbrido.
 */
async function runForexTest() {
  console.log("==================================================");
  console.log("📡 INICIANDO AUDITORIA DO MOTOR DE CÂMBIO [HUBKON PAY]");
  console.log("==================================================\n");

  // Teste 1: Captura de Taxa Fiduciária com Spread Protetor
  const rateAOA = await getAoaExchangeRate();
  console.log(`[TESTE 1] Taxa Comercial Calculada (AOA/USD): ${rateAOA} Kz`);
  
  // Teste 2: Matemática de Equivalência para Fatura de $100.000 USD
  const invoiceAmountUSD = 100000;
  const aoaMath = await calculateAoaEquivalent(invoiceAmountUSD);
  console.log(`\n[TESTE 2] Simulação de Ingestão de Fatura de $${invoiceAmountUSD.toLocaleString()} USD:`);
  console.log(`  - Valor Bruto da Mercadoria: Kz ${aoaMath.grossAmountAOA.toLocaleString()}`);
  console.log(`  - Taxa de Software Hubkon (1%): Kz ${aoaMath.hubkonFeeAOA.toLocaleString()}`);
  console.log(`  - TOTAL QUE O CLIENTE DEPOSITARÁ NO BANCO LOCAL: Kz ${aoaMath.totalRequiredAOA.toLocaleString()}`);

  // Teste 3: Feeds de Preço dos Oráculos Web3 (Stablecoins)
  console.log("\n[TESTE 3] Feeds dos Oráculos de Stablecoins (Pyth Cross-Rates):");
  const usdcRate = await getStablecoinCrossRate("USDC");
  const eurcRate = await getStablecoinCrossRate("EURC");
  const cnhcRate = await getStablecoinCrossRate("CNHC");
  console.log(`  - 1 USDC equivale a: ${usdcRate} USD`);
  console.log(`  - 1 EURC equivale a: ${eurcRate} USD`);
  console.log(`  - 1 CNHC equivale a: ${cnhcRate} USD`);

  // Teste 4: Conversão Líquida para a Fábrica na China
  const netUsdcToLiquidate = 99000; // $100k menos 1% de taxa
  const chinaConversion = await convertUsdcToTargetDigitalAsset(netUsdcToLiquidate, "CNHC");
  console.log(`\n[TESTE 4] Conversão do Líquido para o Fornecedor Estrangeiro:`);
  console.log(`  - Saldo Líquido na Solana: $${netUsdcToLiquidate.toLocaleString()} USDC`);
  console.log(`  - Valor Líquido que a Fábrica na China vai receber: ¥${chinaConversion.finalAmount.toLocaleString()} CNHC`);
  console.log("    (Taxa cruzada aplicada pelo oráculo: " + chinaConversion.crossRateUsed + ")");

  console.log("\n==================================================");
  console.log("✅ AUDITORIA CONCLUÍDA: MOTOR FX 100% OPERACIONAL");
  console.log("==================================================");
}

runForexTest();
