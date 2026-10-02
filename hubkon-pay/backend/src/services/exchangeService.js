/**
 * @file exchangeService.js
 * @description Hybrid Exchange Oracle Framework for HUBKON PAY.
 * Connects CeFi (Kwanza local rates) to DeFi (Pyth Network on Solana) with Redis Cache.
 * Version: V.1022 ELITE ✅
 */

import { Connection, PublicKey } from '@solana/web3.js';
import pythReceiverPkg from '@pythnetwork/pyth-solana-receiver';
import Redis from 'ioredis';

// Extração segura da classe principal para suportar o formato de compilação do pacote
const { PythSolanaReceiver } = pythReceiverPkg;

// Conexão automática ao teu Redis local do WSL que já está online
const redis = new Redis(); 

// Inicialização estável utilizando o nó RPC público oficial da Solana Devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Contas de Feeds de Preço Oficiais do Pyth na Solana Devnet (Chaves Públicas Base58 Válidas)
const USDC_PRICE_FEED_ACCOUNT = new PublicKey("Gnt2wK7xnXCn3eYzhqqC6wXGCv85md8Wge5ewvUL7D8j"); // Devnet USDC/USD Real
const EURC_PRICE_FEED_ACCOUNT = new PublicKey("2ci2vG7cc7dgUFZ4fM5uU98cA6nU9ikFVC65okmsLaL1"); // Devnet EUR/USD Real

class ExchangeService {
    
    /**
     * @notice Captura a taxa oficial do Kwanza base (CeFi Endpoint)
     * @dev A expandir na Fase 2 com o convênio oficial do teu banco local (BAI/BFA/BNA)
     */
    static async getKwanzaBaseRate() {
        return 850.00; // Taxa corporativa estável simulada: 1 USD = 850.00 AOA
    }

    /**
     * @notice Puxa em milissegundos o preço real de um ativo cripto lendo a conta do Pyth na Solana
     */
    static async getSolanaPriceFromPyth(feedAccountKey) {
        try {
            // Inicializa o receptor do Pyth injetando a conexão RPC configurada
            const pythReceiver = new PythSolanaReceiver({ connection });
            
            // Puxa o estado atualizado do feed guardado em conta na rede Solana
            const priceData = await pythReceiver.getLatestPriceFeed(feedAccountKey);
            
            if (!priceData || !priceData.price) {
                throw new Error("Dados de preço ausentes ou corrompidos na conta do Oráculo.");
            }
            
            // Tratamento matemático padrão da infraestrutura do Pyth (Inteiro * 10^Expoente)
            const price = Number(priceData.price.price) * Math.pow(10, priceData.price.exponent);
            return price;
        } catch (error) {
            console.error("❌ [SRO ORACLE ALERT] Falha ao extrair dados do Pyth na Solana:", error.message);
            
            // Fallback de Segurança Operacional (SRO): Se o oráculo cair, assume o preço de paridade 1:1 estável temporariamente
            return 1.00; 
        }
    }

    /**
     * @notice Motor de Reconciliação Híbrido Multi-Moeda com Cache no Redis (5 Minutos)
     */
    static async getConversionRate(fromCurrency, toCurrency) {
        const cacheKey = `hubkon:rate:${fromCurrency}:${toCurrency}`;
        
        // 1️⃣ Consulta rápida à cache do Redis local para performance multi-tenant
        const cachedRate = await redis.get(cacheKey);
        if (cachedRate) {
            return parseFloat(cachedRate);
        }

        let finalRate;
        const kwanzaBase = await this.getKwanzaBaseRate();

        // 2️⃣ Se não estiver em cache, faz o cálculo híbrido em tempo real
        if (fromCurrency === "AOA" && toCurrency === "USDC") {
            const usdcInUsd = await this.getSolanaPriceFromPyth(USDC_PRICE_FEED_ACCOUNT);
            finalRate = kwanzaBase / usdcInUsd;
        } else if (fromCurrency === "AOA" && toCurrency === "EURC") {
            const eurcInUsd = await this.getSolanaPriceFromPyth(EURC_PRICE_FEED_ACCOUNT);
            finalRate = kwanzaBase / eurcInUsd;
        } else {
            throw new Error(`O par cambial ${fromCurrency}/${toCurrency} não é comportado pela Engine.`);
        }

        // 3️⃣ Salva no teu Redis com tempo de expiração estrito de 5 minutos (300 segundos)
        await redis.set(cacheKey, finalRate, "EX", 300);
        return finalRate;
    }
}

export default ExchangeService;
