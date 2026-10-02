/**
 * @file web3Mints.js
 * @description Centralized SPL Token Mint Addresses for HUBKON Multi-Currency Core.
 * Maps sovereign currencies to active cryptographic network instances.
 * Version: V.1030 MULTI-CURRENCY ELITE ✅
 */

import { PublicKey } from "@solana/web3.js";

export const WEB3_MINTS = {
    // 💵 Dólar Americano: Endereço padrão estável do USDC na Solana Devnet/Mainnet
    USD: {
        symbol: "USD",
        name: "Hubkon USD Stablecoin",
        mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Endereço oficial USDC SPL
        decimals: 6
    },
    // 💶 Euro Europeu: Endereço estável do EURC da Circle na Solana
    EUR: {
        symbol: "EUR",
        name: "Hubkon EUR Stablecoin",
        mintAddress: "Hzwq8t2Y84CQYZQz7t7GStC7ZBA8bQ2SpWH6rGfWZ322", // Endereço oficial EURC SPL
        decimals: 6
    },
    // ¥ Yuan Chinês Offshore: Endereço estruturado para o corredor asiático da Rota da Seda
    CNH: {
        symbol: "CNH",
        name: "Hubkon CNH Stablecoin",
        mintAddress: "HUBKCNH26ZkudjLW2dAp6gFbHykon8owp2T7yZkgjQCNH", // Mint proprietária HUBKON CNH SPL
        decimals: 6
    }
};

/**
 * @function getMintByCurrency
 * @description Auxiliar do SRO para extrair metadados criptográficos com base na divisa da fatura.
 */
export const getMintByCurrency = (currency) => {
    const cleanCurrency = String(currency).toUpperCase().trim();
    const mintData = WEB3_MINTS[cleanCurrency];
    
    if (!mintData) {
        console.warn(`⚠️ [MINT_CORE] Divisa "${currency}" não possui Mint SPL mapeada. Utilizando fallback USD.`);
        return {
            ...WEB3_MINTS.USD,
            publicKey: new PublicKey(WEB3_MINTS.USD.mintAddress)
        };
    }
    
    return {
        ...mintData,
        publicKey: new PublicKey(mintData.mintAddress)
    };
};
