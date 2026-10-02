"use client";
import { useState, useEffect } from "react";
import './globals.css';
import Sidebar from './components/Sidebar';
import useAuth from './Hook/useAuth';
import { usePathname } from "next/navigation";

// 📡 AC OP LAMENTO DA INFRAESTRUTURA WEB3 (Fase 3): Importa o escudo de carteiras
import WalletContextProvider from '../providers/WalletContextProvider';

export default function RootLayout({ children }) {
  const { authenticated, loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Garante que o código só execute a lógica de UI no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/";
  
  // Só avaliamos showSidebar se estiver montado, caso contrário o servidor envia 'false'
  const showSidebar = mounted && !isAuthPage && authenticated && !loading;

  return (
    <html lang="pt" suppressHydrationWarning> 
      <body 
        className="bg-[#080c14] text-slate-300 font-sans flex overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* 🔒 INJEÇÃO DO ESCUDO WEB3: Envolve toda a lógica da HUBKON PAY no pipeline não-custodial */}
        <WalletContextProvider>
          
          {/* Renderiza a Sidebar apenas se passar na validação e estiver no cliente */}
          {showSidebar && <Sidebar />}

          <main className={`flex-1 min-h-screen transition-all duration-300 ${showSidebar ? 'ml-64' : 'ml-0'}`}>
            {children}
          </main>

        </WalletContextProvider>
      </body>
    </html>
  );
}
