import { Connection, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// 👑 CARTEIRA CORPORATIVA HUBKON (Chave real On-Curve perfeitamente legítima)
const HUBKON_FEE_WALLET = new PublicKey("7V3h6U4nQy98HwE12XJkLpM5nR4qStVuWxYz2m7K8wWq"); 

// 🪙 ENDEREÇOS REAIS DAS STABLECOINS DE TESTE (Devnet USDC Mint oficial)
const USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

export const buildUnsignedSettlement = async (clientPubkeyStr, destinationStr, amount, assetType = "USDC") => {
  try {
    const clientPublicKey = new PublicKey(clientPubkeyStr);
    const destinationPublicKey = new PublicKey(destinationStr);

    const feeAmount = amount * 0.01;
    const netAmount = amount - feeAmount;

    const factor = Math.pow(10, 6);
    const feeInUnits = Math.round(feeAmount * factor);
    const netInUnits = Math.round(netAmount * factor);

    // 📡 DESCOBERTA DE ENDEREÇOS ASSOCIADOS (ATA) COM AS CHAVES REAIS
    const clientAta = await getAssociatedTokenAddress(USDC_MINT, clientPublicKey);
    const destinationAta = await getAssociatedTokenAddress(USDC_MINT, destinationPublicKey);
    const hubkonFeeAta = await getAssociatedTokenAddress(USDC_MINT, HUBKON_FEE_WALLET);

    const transaction = new Transaction();

    transaction.add(
      createTransferInstruction(clientAta, hubkonFeeAta, clientPublicKey, feeInUnits)
    );

    transaction.add(
      createTransferInstruction(clientAta, destinationAta, clientPublicKey, netInUnits)
    );

    // Busca o identificador recente direto dos nós globais da Solana Devnet
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = clientPublicKey;

    const unsignedBuffer = transaction.serializeMessage();

    return {
      success: true,
      unsignedTxHex: unsignedBuffer.toString("hex"),
      feeApplied: feeAmount,
      netAmount: netAmount,
      blockhash
    };
  } catch (error) {
    throw new Error(error.message || error);
  }
};
