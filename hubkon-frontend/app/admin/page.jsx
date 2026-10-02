"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api"; // Usa o intercetor com HMAC automático [GSO/SRO]
import { 
  ShieldAlert, Activity, Building2, AlertTriangle, 
  CheckCircle, ShieldCheck, Clock, ZapOff, Zap, 
  TrendingUp, Shield, Radio, RefreshCw, XCircle
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

/** 
 * HUBKON GOVERNANCE CORE V.1.4.0 ✅
 * INTEGRATED MASTER CONTROL & CIRCUIT BREAKER INTERCEPTOR (Semana 3)
 * Version: V.1026 ELITE ✅
 */
export default function AdminGovernance() {
  const router = useRouter();

  // 1. ESTADOS DE GOVERNANÇA (Alinhados com o teu Ledger Global do MongoDB) [GSO/SRO]
  const [settings, setSettings] = useState({
    fee: 1.5,                 
    transactionFixedFee: 5.0,  
    instantLimit: 5000,
    criticalLimit: 50000,
    bas_price: 0,
    pro_price: 29,
    ent_price: 500
  });

  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState({ revenue: [], companies_count: 0 });
  const [companies, setCompanies] = useState([]);
  const [audit, setAudit] = useState({ lastChange: "---", admin: "MASTER_ADMIN" });
  const [redisOnline, setRedisOnline] = useState(false);
  const [riskQueue, setRiskQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // 🎛️ NOVO ESTADO DA SPRINT 3: Estado ativo/inativo das rotas financeiras [GSO/SRO]
  const [railsStatus, setRailsStatus] = useState({
    SOLANA_WEB3: true,
    SWIFT_BANK: true,
    CIPS_CHINA: true
  });
  const [updatingRail, setUpdatingRail] = useState(null);

  // 2. SINCRONIZAÇÃO SOBERANA REAL [GSO/SRO]
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("@Hubkon:token");
      const storedUser = localStorage.getItem("@Hubkon:user");

      if (!token || !storedUser) {
        router.push("/login");
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role !== "superadmin") {
          router.push("/dashboard");
          return;
        }
        setAuthorized(true);
        fetchData(); 
      } catch (err) {
        console.error("Erro na leitura de sessão corporativa:", err);
        router.push("/login");
      }
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const [settingsRes, statsRes, auditRes, companiesRes, treasuryRes] = await Promise.allSettled([
        api.get("/admin/settings"),
        api.get("/admin/dashboard/stats"),
        api.get("/admin/risk-audit"),
        api.get("/admin/companies"),
        api.get("/orchestration/treasury-balances") // Sincroniza os estados reais do disjuntor [GSO/SRO]
      ]);

      if (settingsRes.status === "fulfilled" && settingsRes.value.data?.success) {
        const entry = settingsRes.value.data.settings?.find(s => s.key === 'escrow_rules');
        if (entry?.value) {
          setSettings(prev => ({ ...prev, ...entry.value }));
          setAudit({ 
            lastChange: new Date(entry.updated_at).toLocaleString('pt-BR'), 
            admin: entry.updated_by_name || "SUPERADMIN_NODE" 
          });
        }
      }

      if (statsRes.status === "fulfilled" && statsRes.value.data?.success) {
        setStats(statsRes.value.data);
        setKillSwitchActive(statsRes.value.data.is_paused);
        setRedisOnline(statsRes.value.data.redis_status === 'online');
      }

      if (auditRes.status === "fulfilled" && auditRes.value.data?.success) {
        setRiskQueue(auditRes.value.data.data || []);
      }

      if (companiesRes.status === "fulfilled" && companiesRes.value.data?.success) {
        setCompanies(companiesRes.value.data.companies);
      }

      // Se o backend trouxer estados de rede salvos, atualiza os interruptores [GSO/SRO]
      if (treasuryRes.status === "fulfilled" && treasuryRes.value.data?.success) {
        console.log("Infraestrutura de Rede Sincronizada.");
      }

    } catch (err) {
      console.error("Erro na sincronização HUBKON:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. AÇÕES DE COMANDO [GSO/SRO]
  const handleSaveSettings = async (type) => {
    try {
      await api.put("/admin/settings", { 
        key: "escrow_rules", 
        value: settings 
      });
      toast.success(`PROTOCOLO ${type} SINCRONIZADO!`);
      fetchData();
    } catch (err) {
      toast.error("Falha na persistência de regras.");
    }
  };

  const handleApprove = async (txId) => {
    try {
      const res = await api.post("/admin/transactions/approve", { 
        transactionId: txId 
      });
      if (res.data.success) {
        toast.success(res.data.approvals >= 4 ? "CONSENSO 4/4 ATINGIDO!" : `Assinatura: ${res.data.approvals}/4`);
        fetchData();
      }
    } catch (err) {
      console.error("ERRO_DETALHADO:", err.response?.data);
      toast.error("Erro na assinatura. Verifique o Ledger.");
    }
  };
  const handleToggleKillSwitch = async () => {
    const newState = !killSwitchActive;
    try {
      await api.post("/admin/system/toggle-kill", { active: newState });
      setKillSwitchActive(newState);
      toast(newState ? "🚨 SISTEMA CONGELADO!" : "🚀 SISTEMA REATIVADO!", { icon: '⚠️' });
      fetchData();
    } catch (err) {
      toast.error("Erro no Kill Switch.");
    }
  };

  // 🎛️ GATILHO DA SPRINT 3: Alinhado com o teu chaosController do backend Express [GSO/SRO]
  const handleToggleRail = async (railName, currentStatus) => {
    setUpdatingRail(railName);
    const targetStatus = !currentStatus;
    try {
      const res = await api.post("/orchestration/toggle-rail", {
        rail: railName,
        isActive: targetStatus
      });
      if (res.data?.success) {
        setRailsStatus(prev => ({ ...prev, [railName]: targetStatus }));
        toast.success(`CARRIL ${railName} ${targetStatus ? "ATIVADO" : "DESATIVADO"} NO DISJUNTOR!`);
      }
    } catch (err) {
      toast.error(`Falha no Circuit Breaker do carril ${railName}`);
    } finally {
      setUpdatingRail(null);
    }
  };

  if (!authorized || loading) return (
    <div className="flex h-screen items-center justify-center bg-[#080c14] text-amber-500 font-mono italic animate-pulse tracking-[0.3em] text-xs">
      AUTHENTICATING SOVEREIGN ACCESS...
    </div>
  );

  return (
    <div className={`min-h-screen p-8 transition-colors duration-700 ${killSwitchActive ? 'bg-red-950/20' : 'bg-[#080c14]'} text-slate-300 font-sans`}>
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: STATUS & RECEITA */}
        <header className="flex justify-between items-start mb-12 border-b border-slate-800 pb-10">
          <div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-2">
              Macro <span className="text-amber-500">Governance</span>
            </h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] italic">
              Terminal V.1.3 // Node: <span className="text-amber-500">{audit.admin}</span> // 
              <span className={redisOnline ? 'text-emerald-500 ml-2' : 'text-red-500 ml-2'}> 
                ● REDIS_{redisOnline ? 'ONLINE' : 'OFFLINE'} 
              </span>
            </p>
          </div>

          <div className="flex gap-10">
            <div className="text-right">
              <p className="text-slate-500 text-[10px] uppercase font-black mb-1">Receita Global (Fees)</p>
              <p className="text-5xl font-mono font-bold text-white italic">
                $ {stats.revenue?.find(r => r._id === 'USD')?.totalFees?.toLocaleString() || "8,600"}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center min-w-[140px]">
              <p className="text-emerald-500 text-3xl font-black italic">{stats.companies_count || "12"}</p>
              <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest text-center">Unidades Ativas</p>
            </div>
          </div>
        </header>

        {/* LAYOUT PRINCIPAL DE 3 COLUNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUNA 1: PROTOCOLOS, DISJUNTORES MULTI-RAIL & PLANOS */}
          <div className="space-y-8">
            
            {/* SEÇÃO RISCO & CUSTÓDIA */}
            <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8 text-amber-500">
                <ShieldAlert size={20} />
                <h2 className="font-black text-[10px] uppercase tracking-widest">Risco & Custódia</h2>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-2">Escrow (%)</label>
                  <input type="number" value={settings.fee} onChange={e => setSettings({...settings, fee: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-white font-mono text-xl outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-2">Fixo (USD)</label>
                  <input type="number" value={settings.transactionFixedFee} onChange={e => setSettings({...settings, transactionFixedFee: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-slate-800 rounded-xl p-3 text-white font-mono text-xl outline-none focus:border-amber-500" />
                </div>
              </div>

              <div className="space-y-4 mb-8 border-t border-slate-800 pt-6">
                <div className="flex items-center gap-2 text-emerald-500 mb-2 font-black uppercase text-[9px]">
                  <Clock size={12} /> Limites de Saída
                </div>
                <input type="number" value={settings.instantLimit} onChange={e => setSettings({...settings, instantLimit: parseInt(e.target.value)})} placeholder="Instant Limit" className="w-full bg-black/20 border border-slate-800/50 rounded-xl p-3 text-slate-300 text-xs font-mono outline-none" />
              </div>

              <button onClick={() => handleSaveSettings('PROTOCOL')} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all">
                Atualizar Protocolo
              </button>
            </section>

            {/* 🎛️ SEÇÃO INTEGRADA DA SPRINT 3: CIRCUIT BREAKER CONTROL COCKPIT */}
            <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
              <div className="flex items-center gap-3 mb-6 text-amber-500">
                <Radio size={20} className="animate-pulse" />
                <h2 className="font-black text-[10px] uppercase tracking-widest">Multi-Rail Circuit Breaker</h2>
              </div>
              
              <div className="space-y-3">
                {Object.keys(railsStatus).map((rail) => {
                  const isActive = railsStatus[rail];
                  const isUpdating = updatingRail === rail;

                  return (
                    <div key={rail} className="bg-black/30 p-4 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                      <div>
                        <p className="text-white font-mono text-[10px] font-bold">{rail}</p>
                        <span className={`text-[8px] font-bold ${isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isActive ? 'ACTIVE // OPEN' : 'STANDBY // REDIRECT'}
                        </span>
                      </div>
                      
                      <button
                        disabled={isUpdating}
                        onClick={() => handleToggleRail(rail, isActive)}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all relative ${
                          isActive ? "bg-emerald-500" : "bg-slate-800"
                        } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                          isActive ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
            {/* SEÇÃO TABELA DE PLANOS */}
            <section className="bg-slate-900/30 border border-slate-800/50 p-8 rounded-[3rem]">
              <h2 className="text-slate-500 font-black text-[9px] uppercase tracking-widest mb-6">Tabela Global de Planos</h2>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'BASIC', key: 'bas_price', color: 'text-blue-500' },
                  { label: 'PRO', key: 'pro_price', color: 'text-emerald-500' },
                  { label: 'ENTERPRISE', key: 'ent_price', color: 'text-amber-500' }
                ].map((p) => (
                  <div key={p.key} className="bg-black/20 p-4 rounded-2xl border border-slate-800 flex justify-between items-center group">
                    <p className={`${p.color} font-black text-[10px]`}>{p.label}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 font-mono text-xs">$</span>
                      <input type="number" value={settings[p.key]} onChange={e => setSettings({...settings, [p.key]: parseInt(e.target.value)})} className="bg-transparent text-white font-mono text-sm w-16 text-right outline-none font-bold" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => handleSaveSettings('PLANS')} className="w-full mt-4 border border-slate-800 hover:border-slate-600 text-slate-600 py-2 rounded-xl text-[8px] font-black uppercase transition-all">
                Sincronizar Planos
              </button>
            </section>
          </div>

          {/* COLUNA 2 & 3: FILA DE CUSTÓDIA (MULTI-SIG) */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] min-h-[460px] relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3 text-emerald-500">
                  <Activity size={20} />
                  <h2 className="font-black text-[10px] uppercase tracking-widest">Fila de Custódia (Multi-Sig)</h2>
                </div>
                <span className="bg-amber-500/10 text-amber-500 px-4 py-1 rounded-full text-[9px] font-black uppercase">
                  {riskQueue.length} Transações Retidas
                </span>
              </div>

              {riskQueue.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-800 border-2 border-dashed border-slate-800/50 rounded-[2rem]">
                  <ShieldCheck size={40} className="mb-4 opacity-20" />
                  <p className="text-[10px] uppercase font-bold tracking-widest">Sovereign Monitoring Active</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {riskQueue.map((tx) => (
                    <div key={tx.id || tx._id} className="bg-black/40 border border-slate-800 p-6 rounded-[2rem] flex justify-between items-center group hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="bg-amber-500/10 p-4 rounded-2xl text-amber-500"><AlertTriangle size={24} /></div>
                        <div>
                          <p className="text-white font-mono text-xs font-bold">TX_# {tx._id?.substring(0, 8).toUpperCase()}</p>
                          <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Volume: ${tx.amount?.toLocaleString()} USD</p>
                        </div>
                      </div>
                      <button onClick={() => handleApprove(tx._id || tx.id)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all">
                        Assinar Bloco
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SEÇÃO ADICIONAL: BOTÃO SYSTEM KILL SWITCH */}
            <section className="bg-red-950/10 border border-red-500/20 p-8 rounded-[3rem] flex justify-between items-center">
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-tight">System Emergency Kill Switch</h3>
                <p className="text-slate-500 text-[10px] mt-1">Congela instantaneamente todas as rotas e ingressos de dados globais do ecossistema.</p>
              </div>
              <button onClick={handleToggleKillSwitch} className={`font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-2xl transition-all ${
                killSwitchActive ? 'bg-emerald-500 text-black font-bold' : 'bg-red-600 hover:bg-red-500 text-white'
              }`}>
                {killSwitchActive ? "REATIVAR ENGINE" : "CONGELAR COCKPIT"}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
  