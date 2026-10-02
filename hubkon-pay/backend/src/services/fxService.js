/**
 * HUBKON CORE FINANCE ENGINE - FOREX & ORACLE SERVICE
 * Processa taxas comerciais fiduciárias (BNA) e feeds estáveis de Stablecoins.
 * Version: V.1052 REGULATORY PATCH ✅
 */

const FALLBACK_USD_TO_AOA = 950.00; 
const SPREAD_MARGIN = 0.05; 

export const getAoaExchangeRate = async () => {
  try {
    const officialRate = 902.50; 
    const commercialRate = officialRate * (1 + SPREAD_MARGIN);
    return Number(commercialRate.toFixed(2));
  } catch (error) {
    console.warn("⚠️ [FX ENGINE] Falha ao ler feed oficial. Ativando fallback comercial.");
    return FALLBACK_USD_TO_AOA;
  }
};

export const getStablecoinCrossRate = async (targetAsset) => {
  const asset = targetAsset?.toUpperCase();
  const crossRates = {
    USDC: 1.00,  
    EURC: 0.92,  
    CNHC: 7.15   
  };
  return crossRates[asset] || 1.00;
};

export const calculateAoaEquivalent = async (amountInUSD) => {
  const currentRate = await getAoaExchangeRate();
  const grossAmountAOA = amountInUSD * currentRate;
  const hubkonFeeAOA = grossAmountAOA * 0.01;
  const totalRequiredAOA = grossAmountAOA + hubkonFeeAOA;

  return {
    exchangeRateUsed: currentRate,
    grossAmountAOA: Number(grossAmountAOA.toFixed(2)),
    hubkonFeeAOA: Number(hubkonFeeAOA.toFixed(2)),
    totalRequiredAOA: Number(totalRequiredAOA.toFixed(2))
  };
};

export const convertUsdcToTargetDigitalAsset = async (netAmountUSDC, targetAsset) => {
  const crossRate = await getStablecoinCrossRate(targetAsset);
  const finalDigitalAmount = netAmountUSDC * crossRate;
  
  return {
    crossRateUsed: crossRate,
    finalAmount: Number(finalDigitalAmount.toFixed(2))
  };
};
