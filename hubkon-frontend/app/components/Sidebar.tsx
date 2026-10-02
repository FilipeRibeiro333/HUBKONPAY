"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileText, Wallet, Users, Cpu, 
  LogOut, Building2, Settings, ShieldCheck, Webhook, Lock, SlidersHorizontal
} from "lucide-react";
import useAuth from "../Hook/useAuth";

// 📡 ADAPTADORES CRIPTOGRÁFICOS DA SPRINT (Fase 4): Conexão direta com a Phantom
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

/**
 * HUBKON TERMINAL - SIDEBAR B2B CORE
 * Polished for Multi-Currency Engine Production (Semana 13)
 * Refactored with Enterprise Orchestration & Non-Custodial Connect Rail
 * Version: V.1033 MULTI-CURRENCY PRODUCTION MASTER ✅
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const planLevels: Record<string, number> = { "basic": 1, "pro": 2, "enterprise": 3 };
  
  const isSuperAdmin = user?.role === "superadmin";
  const userLevel = isSuperAdmin ? 3 : (planLevels[user?.plan?.toLowerCase()] || 1);

  // 🎛️ MATRIZ ADAPTADA AO ROADMAP ENTERPRISE
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, minLevel: 1 },
    { name: "Orquestrador", href: "/dashboard/settle", icon: SlidersHorizontal, minLevel: 1 }, 
    { name: "Liquidar", href: "/contracts", icon: FileText, minLevel: 1 }, 
    { name: "Tesouraria", href: "/wallet", icon: Wallet, minLevel: 3 }, 
    { name: "Usuários", href: "/users", icon: Users, minLevel: 1 },
    { name: "KYC", href: "/kyc", icon: ShieldCheck, minLevel: 1 },
    { name: "Hook", href: "/Hook", icon: Webhook, minLevel: 2 }, 
    { name: "Blockchain", href: "/explorer", icon: Cpu, minLevel: 3 }, 
    { name: "Pagamentos", href: "/settings/payments", icon: Settings, minLevel: 1 },
  ];

  const getApiKey = () => {
    if (typeof window !== "undefined") {
      if (isSuperAdmin) return "SYS_MASTER_NODE_KEY";
      return localStorage.getItem("@Hubkon:apiKey")?.slice(0, 15) || "API_KEY_MISSING";
    }
    return "CARREGANDO...";
  };
  return (
    <aside className="w-64 h-screen bg-[#080c14] border-r border-slate-800 flex flex-col p-6 fixed left-0 top-0 z-50 font-mono">
      <div className="mb-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Building2 size={20} className="text-black" />
          </div>
          <h1 className="text-white font-black text-xl italic tracking-tighter uppercase">HUBKON</h1>
        </div>
        <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">B2B Terminal v1.3.0</p>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-none">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = !isSuperAdmin && userLevel < item.minLevel;

          return (
            <Link 
              key={item.name} 
              href={isLocked ? "/settings/payments" : item.href} 
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                isActive 
                  ? "bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                  : isLocked 
                    ? "text-slate-700 cursor-not-allowed opacity-50" 
                    : "text-slate-500 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.name}
              </div>
              {isLocked && <Lock size={12} className="text-amber-500" />}
            </Link>
          );
        })}
      </nav>

      {/* 🔒 INJEÇÃO DO BOTÃO DE AC OPLAMENTO DE CARTEIRAS (PASSO 4): Estilizado para Dark Mode Terminal */}
      <div className="my-4 hubkon-wallet-button-wrapper">
        <WalletMultiButton 
          className="!w-full !flex !items-center !justify-center !gap-2 !bg-slate-900 !border !border-slate-800 hover:!border-purple-500/50 !text-purple-400 hover:!text-white !font-bold !py-3 !px-4 !rounded-xl !text-[10px] !uppercase !tracking-widest !transition-all !font-mono !shadow-md"
        />
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="mb-4 px-2">
          <div className="flex justify-between items-center mb-1">
             <p className="text-[10px] font-black text-slate-400 uppercase truncate">
               {isSuperAdmin ? "SYS_OVERLORD" : (user?.name || "Empresa Admin")}
             </p>
             <span className={`text-[7px] px-2 py-0.5 rounded font-black uppercase border ${
               isSuperAdmin 
                 ? "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.05)]" 
                 : "bg-purple-900/40 text-purple-400 border border-purple-500/30"
             }`}>
               {isSuperAdmin ? "OVERLORD" : (user?.plan || "Basic")}
             </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isSuperAdmin || getApiKey() !== "API_KEY_MISSING" ? 'bg-emerald-500' : 'bg-red-500'
            }`}></div>
            <p className="text-[8px] font-mono text-slate-600 truncate">
              {isSuperAdmin ? "NODE_STATUS: ACTIVE" : `ID: ${getApiKey()}...`}
            </p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-[11px] uppercase" >
          <LogOut size={18} /> Encerrar Sessão
        </button>
      </div>
    </aside>
  );
}
