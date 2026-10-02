"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// 🎨 Injeta as folhas de estilo nativas do modal da Solana para garantir o Dark Mode
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * HUBKON CRYPTOGRAPHIC INFRASTRUCTURE - ROOT WEB3 PROVIDER
 * Garante a orquestração de assinaturas delegadas locais com Custódia Zero.
 * Version: V.2045 DECENTRALIZED COCKPIT PATCH ✅
 */
export default function WalletContextProvider({ children }) {
  // Força o pipeline a ler a rede Devnet da Solana para os teus testes de Sandbox
  const network = WalletAdapterNetwork.Devnet;

  // Estabelece o endpoint síncrono de comunicação com os validadores on-chain
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Inicializa a lista de carteiras digitais que o teu Frontend Next.js vai aceitar
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(), // A mais utilizada por fornecedores no exterior [Colosseum]
      new SolflareWalletAdapter(),
    ],
    [network]
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* Envolve toda a tua árvore de ecrãs visuais do dashboard por dentro do escudo Web3 */}
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
