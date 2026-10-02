"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import api from "../../services/api"; // Usa o intercetor blindado com HMAC automático
import { ShieldCheck, Wallet, Lock, Eye, EyeOff, Building2, Users, ChevronRight, BarChart3, Globe, Cpu } from "lucide-react";

/**
 * HUBKON TERMINAL - B2B DASHBOARD V.1.042
 * Refactored with Multi-Rail Treasury Aggregation & Balance Orchestration (Semana 2 - Fase 3)
 * Version: V.1042 MULTI-RAIL ELITE ✅
 */
export default function Dashboard() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // 🛡️ ESQUELETO DE ORGANIZAÇÃO BASE
  const [companyName, setCompanyName] = useState("Hubkon Global Business");
  
  // 📊 NOVO ESTADO DE TESOURARIA MULTI-RAIL (Sincronizado com o teu MongoDB Aggregate)
  const [treasury, setTreasury] = useState({
    feesRetainedUSD: 0,
    networkBalances: {
      SOLANA_WEB3: { USD: 0, EUR: 0, CNH: 0, AOA: 0 },
      SWIFT_BANK: { USD: 0, EUR: 0, CNH: 0, AOA: 0 },
      CIPS_CHINA: { USD: 0, EUR: 0, CNH: 0, AOA: 0 }
    }
  });

  useEffect(() => {
    let isMounted = true;
    
    // Dispara chamadas paralelas para alimentar a organização e a nova tesouraria distribuída
    Promise.all([
      api.get("/dashboard").catch(() => null),
      api.get("/orchestration/treasury-balances").catch(() => null)
    ]).then(([dashboardRes, treasuryRes]) => {
      if (!isMounted) return;

      // 1. Processa dados da organização
      if (dashboardRes?.data?.success) {
        const payload = dashboardRes.data.data || dashboardRes.data;
        setCompanyName(payload.companyName || payload.name || "Hubkon Global Business");
      }

      // 2. Processa a agregação matemática de tesouraria em tempo real
      if (treasuryRes?.data?.success) {
        setTreasury(treasuryRes.data);
      }
    })
    .finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 p-8 font-sans relative">
      
      {/* TELA DE OVERLAY DE CARREGAMENTO FLUIDO */}
      {loading && (
        <div className="absolute top-4 right-4 bg-slate-900 border border-emerald-500/30 text-emerald-500 font-mono text-[9px] px-4 py-2 rounded-full animate-pulse flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-2 w-2 border-t border-emerald-500"></div>
          ORCHESTRATION_LEDGER_SYNCING
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Hubkon <span className="text-emerald-500">Terminal</span>
          </h1>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
            <Building2 size={12} className="text-emerald-500" />
            {companyName}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowBalance(!showBalance)} 
            className="bg-slate-900 border border-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-all shadow-md active:scale-95"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          <div 
            onClick={() => router.push("/admin/circuit-breaker")}
            className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2 rounded-full shadow-lg cursor-pointer hover:border-amber-500 transition-all active:scale-95 group"
          >
            <ShieldCheck className="text-amber-500 w-4 h-4 group-hover:animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              CHAOS ADMINISTRATIVE ACCESS
            </span>
          </div>
        </div>
      </div>
      {/* SECTOR 1: REVENUE RETENTION BAR (Métrica de Lucro de Software) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Plataform Revenue Retained</p>
            <h3 className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
              {showBalance ? `$${treasury.feesRetainedUSD.toLocaleString()} USD` : "••••••"}
            </h3>
          </div>
        </div>
        <div className="text-slate-500 text-[9px] font-bold font-mono border border-slate-800 px-3 py-1.5 rounded-md bg-slate-950/50 uppercase">
          1.0% Technology Commission Active
        </div>
      </div>

      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
        📊 Liquidity & Active Settlement Rails
      </h2>

      {/* KPI GRID MULTI-RAIL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* CARREIL 1: SOLANA WEB3 SUPER-RAIL (Alto Contraste no Euro/Yuan Digital) */}
        <div className="group bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden shadow-2xl transition-all hover:border-purple-500/40">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 flex items-center gap-2">
              <Cpu size={22} />
              <span className="text-[10px] font-black tracking-wider uppercase">Solana Web3 Node</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Net Value Cleared (USD)</p>
          <h2 className="text-3xl font-mono font-bold mt-1 tracking-tighter text-white">
            {showBalance ? `$${treasury.networkBalances.SOLANA_WEB3.USD.toLocaleString()} USDC` : "••••••"}
          </h2>
          {/* 🌟 BRILHO AUMENTADO NO EURO DIGITAL (EURC) */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
            <div className="text-purple-400">EURC: {showBalance ? `$${treasury.networkBalances.SOLANA_WEB3.EUR.toLocaleString()}` : "•••"}</div>
            <div className="text-indigo-400">CNHC: {showBalance ? `$${treasury.networkBalances.SOLANA_WEB3.CNH.toLocaleString()}` : "•••"}</div>
          </div>
        </div>

        {/* CARREIL 2: CIPS CHINA RAIL (Alto Contraste no Kwanza) */}
        <div className="group bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden shadow-2xl transition-all hover:border-red-500/40">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400 flex items-center gap-2">
              <Globe size={22} />
              <span className="text-[10px] font-black tracking-wider uppercase">CIPS Eastern Rail</span>
            </div>
            <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded font-mono text-slate-500 font-bold border border-slate-800">ISO 20022</span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Net Value Cleared (CNH)</p>
          <h2 className="text-3xl font-mono font-bold mt-1 tracking-tighter text-white">
            {showBalance ? `¥${treasury.networkBalances.CIPS_CHINA.CNH.toLocaleString()} CNH` : "••••••"}
          </h2>
          {/* 🌟 BRILHO AUMENTADO NO KWANZA (AOA Escrow) */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
            <div className="text-slate-300">USD Node: {showBalance ? `$${treasury.networkBalances.CIPS_CHINA.USD.toLocaleString()}` : "•••"}</div>
            <div className="text-red-400">AOA Escrow: {showBalance ? `Kz${treasury.networkBalances.CIPS_CHINA.AOA.toLocaleString()}` : "•••"}</div>
          </div>
        </div>

        {/* CARREIL 3: SWIFT GLOBAL BANK RAIL (Alto Contraste no Euro/Kwanza Tradicional) */}
        <div className="group bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden shadow-2xl transition-all hover:border-blue-500/40">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 flex items-center gap-2">
              <Wallet size={22} />
              <span className="text-[10px] font-black tracking-wider uppercase">SWIFT Western Rail</span>
            </div>
            <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded font-mono text-slate-500 font-bold border border-slate-800">Bespoke</span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Net Value Cleared (USD/EUR)</p>
          <h2 className="text-3xl font-mono font-bold mt-1 tracking-tighter text-white">
            {showBalance ? `$${treasury.networkBalances.SWIFT_BANK.USD.toLocaleString()} USD` : "••••••"}
          </h2>
          {/* 🌟 BRILHO AUMENTADO NO KWANZA E EURO TRADICIONAIS */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
            <div className="text-amber-500">EUR Node: {showBalance ? `€${treasury.networkBalances.SWIFT_BANK.EUR.toLocaleString()}` : "•••"}</div>
            <div className="text-blue-400">AOA Node: {showBalance ? `Kz${treasury.networkBalances.SWIFT_BANK.AOA.toLocaleString()}` : "•••"}</div>
          </div>
        </div>

      </div>
      
      <div className="mt-20 border-t border-slate-800 pt-6 text-center">
        <p className="text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold italic">
          Hubkon B2B Protocol v1.0.42 // Sovereign Aggregator Terminal Connected
        </p>
      </div>
    </div>
  );
}

