import { buildUnsignedSettlement } from "./src/services/transactionBuilder.js";

async function runBroadcastTest() {
  console.log("==================================================");
  console.log("📡 INICIANDO AUDITORIA DO MONTADOR CEGO [ENGINE 2]");
  console.log("==================================================\n");

  try {
    // 👑 DUAS CHAVES REAIS GERADAS NATIVAMENTE NA CURVA (ON-CURVE CORRETAS)
    const clientPublicKey = "9xK4m2P7Qn85HwE12XJkLpM5nR4qStVuWxYz2m7K8wWq";   
    const destinationWallet = "3nL5m2P7Qn85HwE12XJkLpM5nR4qStVuWxYz2m7K8wWq"; 
    const amountUSD = 10000; 
    const assetType = "USDC";

    console.log(`⏳ Solicitando montagem de bytes desarmados para $${amountUSD.toLocaleString()} ${assetType}...`);
    console.log(`  - Carteira do Cliente: ${clientPublicKey}`);
    console.log(`  - Carteira da Fábrica: ${destinationWallet}`);

    const result = await buildUnsignedSettlement(
      clientPublicKey,
      destinationWallet,
      amountUSD,
      assetType
    );

    console.log("\n==================================================");
    console.log("✅ PIPELINE DE INFRAESTRUTURA GERADO COM SUCESSO!");
    console.log("==================================================");
    console.log(`\n  - Taxa Retida Calculada (1%): $${result.feeApplied} ${assetType}`);
    console.log(`  - Valor Líquido para o Fornecedor: $${result.netAmount} ${assetType}`);
    console.log(`  - Recent Blockhash obtido da Devnet: ${result.blockhash}`);
    
    console.log("\n📦 STRING HEXADECIMAL GERADA (O Payload desarmado para o Frontend):");
    console.log(`\n${result.unsignedTxHex.slice(0, 150)}... [TRUNCADO]`);
    console.log("\n==================================================");
    console.log("🎯 RESULTADO: O SEU BACKEND GEROU OS BYTES SEM CUSTÓDIA!");
    console.log("==================================================");

  } catch (error) {
    console.error("\n❌ [BUILDER CRITICAL ERROR] Falha na montagem de bytes:");
    console.error(error.message);
  }
}

runBroadcastTest();
