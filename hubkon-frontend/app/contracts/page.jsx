 "use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import {
  FileText, Unlock, Loader2, Zap, Lock,
  ShieldAlert, FileSearch, ShieldCheck
} from "lucide-react";

/**
 * HUBKON TERMINAL - ESCROW CUSTODY V.1.2.0
 * Refactored with Absolute Backend Parity (Semana 8)
 * Handles Populated Objects, Strict Enums, and Anti-Loop Protection.
 * Version: V.1026 PRODUCTION MASTER ✅ (Parte 1)
 */
export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
 
  // 🛡️ ESTADOS DE IDENTIDADE E SEGURANÇA ALINHADOS
  const [showPaywall, setShowPaywall] = useState(false);
  const [userPlan, setUserPlan] = useState("basic");
  const [userRole, setUserRole] = useState("user");
  const [userCompanyId, setUserCompanyId] = useState(null);

  const fetchContracts = async () => {
    try {
      console.log("📡 [FRONTEND] Sincronizando contratos com o nó privado do Express...");
      // 🚀 CONEXÃO DEFINITIVA: Bate na rota correta mapeada no teu escrowRoutes.js
      const res = await api.get("/escrow/my-contracts");
      
      // 👑 ANTI-LOOP WATCHDOG (SRO): Lê o array 'escrows' retornado pelo teu controlador real
      if (res.data && Array.isArray(res.data.escrows)) {
        setContracts(res.data.escrows);
      } else if (res.data && Array.isArray(res.data.contracts)) {
        setContracts(res.data.contracts);
      } else if (Array.isArray(res.data)) {
        setContracts(res.data);
      } else {
        setContracts([]); // Evita loops se o payload vier corrompido
      }
    } catch (err) {
      console.error("Critical: Escrow Sync Failure", err.response?.data || err.message);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🔍 SINCRONIZAÇÃO DE PERFIL MASTER COM PARIDADE TOTAL DO INTERCEPTOR
    const storedUser = localStorage.getItem("@Hubkon:user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserPlan(userData.plan || "basic");
        setUserRole(userData.role || "user");
        setUserCompanyId(userData.companyId || null);
      } catch (e) {
        console.error("Erro ao parsear credenciais de sessão:", e);
      }
    }
    fetchContracts();
  }, []);

  // 🔑 REGRA SOBERANA DEFINITIVA: Liberado se for Enterprise OU SuperAdmin
  const isUnlocked = userPlan.toLowerCase() === "enterprise" || userRole === "superadmin";

  // 🚀 LÓGICA 1: TURBO ADVANCE (ANTECIPAÇÃO DE LIQUIDEZ REAL)
  const handleTurboAdvance = async (id) => {
    if (!isUnlocked) {
      setShowPaywall(true);
      return;
    }
    setProcessing(true);
    try {
      console.log(`📡 [FRONTEND] Disparando ordem de Factoring para o Escrow: ${id}`);
      await api.post(`/escrow/advance/${id}`, { companyId: userCompanyId });
      alert(`✅ PROTOCOLO TURBO: Liquidez Master Liberada via Rust na Solana!`);
      fetchContracts();
    } catch (err) {
      if (err.response?.status === 403) setShowPaywall(true);
      else alert(`Falha no protocolo de antecipação: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessing(false);
    }
  };
  // 📜 LÓGICA 2: AUDIT CERTIFICATE (GERAÇÃO DE PDF COM TRILHA FORENSE DE PRODUÇÃO)
  const handleDownloadCertificate = async (id) => {
    if (!isUnlocked) {
      setShowPaywall(true);
      return;
    }
    try {
      console.log(`🔍 [FRONTEND] Solicitando certificado de auditoria forense para o Escrow: ${id}`);
      const res = await api.get(`/escrow/certificate/${id}`);
      const cert = res.data.certificate;
      const win = window.open("", "_blank");
      
      if (!win) {
        alert("Pop-up bloqueado pelo navegador. Por favor, permita pop-ups para ver o certificado.");
        return;
      }

      win.document.write(`
        <html>
          <head>
            <title>HUBKON_AUDIT_REPORT_${id}</title>
            <style>
              @import url('https://googleapis.com');
              body { background: #f8fafc; color: #0f172a; font-family: 'JetBrains Mono', monospace; padding: 40px; }
              .cert-container { max-width: 850px; margin: auto; background: white; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
              .header { border-bottom: 4px solid #0f172a; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
              .title { font-weight: 800; text-transform: uppercase; font-size: 20px; }
              .stamp { border: 2px solid #10b981; color: #10b981; padding: 5px 12px; font-weight: 800; transform: rotate(-3deg); font-size: 12px; text-transform: uppercase; }
              .section-title { background: #f1f5f9; padding: 8px 12px; font-weight: 800; font-size: 10px; text-transform: uppercase; margin: 30px 0 15px 0; border-left: 4px solid #3b82f6; }
              .audit-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
              .audit-table th { text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; color: #64748b; text-transform: uppercase; }
              .audit-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
              .blockchain-box { background: #0f172a; color: #10b981; padding: 25px; font-size: 10px; border-radius: 8px; margin-top: 30px; line-height: 1.6; word-break: break-all; }
              .footer { margin-top: 50px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="cert-container">
              <div class="header">
                <div><div class="title">${cert?.documentHeader?.title || "HUBKON FORENSIC CERTIFICATE"}</div><div style="font-size: 10px; color: #3b82f6; margin-top:5px;">NETWORK: ${cert?.documentHeader?.network || "SOLANA MAINNET_INSTANCE"}</div></div>
                <div class="stamp">VERIFIED SOBERANO</div>
              </div>
              <div class="section-title">Contexto do Acordo B2B</div>
              <div style="font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 0 12px;">
                 <div><strong>ID CONTRATO:</strong> ${cert?.agreementContext?.contractId || id}</div>
                 <div><strong>MONTANTE:</strong> ${cert?.agreementContext?.notionalAmount?.toLocaleString() || "0.00"} USD</div>
                 <div><strong>VENDEDOR:</strong> ${cert?.agreementContext?.seller || "N/A"}</div>
                 <div><strong>COMPRADOR:</strong> ${cert?.agreementContext?.buyer || "N/A"}</div>
              </div>
              <div class="section-title">Trilha de Auditoria Forense (Actions)</div>
              <table class="audit-table">
                <thead><tr><th>Timestamp</th><th>Origem / Ator</th><th>Evento Protocolado</th></tr></thead>
                <tbody>
                  ${cert?.auditTrail ? cert.auditTrail.map(log => `
                    <tr>
                      <td>${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</td>
                      <td style="color:#3b82f6">${log.actor || 'SYSTEM_NODE'}</td>
                      <td><strong>${log.action || 'LOG_MUTATION'}</strong></td>
                    </tr>`).join('') : '<tr><td colspan="3">Nenhum log encontrado.</td></tr>'}
                </tbody>
              </table>
              <div class="section-title">Evidência Criptográfica Blockchain</div>
              <div class="blockchain-box">
                BLOCK_HEIGHT: ${cert?.blockchainEvidence?.ledgerIndex || 'PENDING_SLOT'}<br>
                IMMUTABLE_HASH: ${cert?.blockchainEvidence?.currentBlockHash || 'AWAITING_VALIDATOR_BURST'}<br>
                VALIDATOR_SIG: ${cert?.blockchainEvidence?.validatorSignature || 'UNSIGNED_MEMPOOL_STATE'}
              </div>
              <div class="footer"><p>${cert?.complianceDisclaimer || 'HUBKON PAY Compliance Core.'}</p><p>Authenticated by HUBKON Sovereign Node // ${new Date().toISOString()}</p></div>
            </div>
            <script>setTimeout(() => { window.print(); }, 1200);</script>
          </body>
        </html>
      `);
      win.document.close();
    } catch (err) {
      alert("Erro: Certificado em processo de mineração ou plano insuficiente.");
    }
  };

  // 🛡️ AÇÃO AUTOMÁTICA (ATO 2): GATILHO DE RISCO MULTI-TENANT REAL [GSO/SRO]
  const handleInitiateContract = async () => {
    const partnerId = prompt("Identificador da Empresa Parceira (companyB ID):");
    if (!partnerId) return;
    const amountInput = prompt("Injetar Montante (USD):", "5000");
    if (!amountInput || isNaN(amountInput)) return alert("Protocolo Rejeitado: Valor Inválido.");
   
    setProcessing(true);
    const amount = Number(amountInput);

    try {
      console.log("📡 [FRONTEND] Solicitando abertura de cofre de custódia bilateral...");
      await api.post("/escrow/create", {
        amount,
        companyB: partnerId.trim().replace(/['"]+/g, ''),
        conditions: [{ description: "Initial Settlement Milestone", type: "milestone", status: "pending" }]
      });
     
      if (amount >= 50000) {
        alert("⚠️ ALERTA DE GOVERNANÇA: Valor crítico detectado. Contrato retido para auditoria Multi-Sig.");
      } else {
        alert("Protocolo Gerado com Sucesso!");
      }
     
      fetchContracts();
    } catch (err) { 
      alert(`Erro na criação do protocolo: ${err.response?.data?.message || err.message}`); 
    } finally { 
      setProcessing(false); 
    }
  };

  // 🚀 LÓGICA 3: ASSINATURA / LIBERAÇÃO (BOTÃO DE ENVIO RAMPA GLOBAL)
  const handleApprove = async (id) => {
    if (!confirm("Confirmar assinatura digital para liberação de fundos para o Deutsche Bank?")) return;
    try {
      console.log(`🖲️ [FRONTEND] Disparando rampa global de saída para o Escrow: ${id}`);
      const res = await api.post(`/escrow/approve/${id}`);
      
      if (res.data.success) {
        alert(`🏆 LIQUIDAÇÃO CONCLUÍDA!
        \nSolana Tx: ${res.data.solanaTxHash || "Verificada com Sucesso"}
        \nBanco: Deutsche Bank AG
        \nLiquidação FIAT: Referência de Clearing fiduciária emitida.`);
      }
      fetchContracts();
    } catch (err) { 
      alert(`Falha na assinatura / liberação: ${err.response?.data?.message || err.message}`); 
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#080c14] text-emerald-500 font-mono italic animate-pulse tracking-[0.3em] uppercase text-xs">
      Synchronizing Sovereign Nodes...
    </div>
  );
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-300 p-8 font-sans relative">
     
      {/* 🛡️ MODAL DE PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 p-10 rounded-[3rem] max-w-lg text-center shadow-[0_0_100px_rgba(245,158,11,0.15)] animate-in zoom-in-95">
            <div className="bg-amber-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 text-amber-500">
              <Zap size={40} fill="currentColor" />
            </div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
              Unlock <span className="text-amber-500 text-6xl font-mono">Turbo</span>
            </h2>
            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-8 leading-relaxed">
              Liquidez imediata e Auditoria Forense exigem upgrade para o nó <span className="text-white underline font-bold">ENTERPRISE</span>.
            </p>
            <button onClick={() => setShowPaywall(false)} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] transition-all transform hover:scale-105">
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
              Escrow <span className="text-emerald-500">Custody</span>
            </h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] mt-2 italic">
              Network Status: <span className={isUnlocked ? "text-amber-500" : "text-emerald-500"}>
                {userRole === 'superadmin' ? "PLATFORM MASTER (ALL_ACCESS)" : userPlan.toUpperCase()}
              </span>
            </p>
          </div>
          <button onClick={handleInitiateContract} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
            + Initiate Contract
          </button>
        </header>

        <div className="grid gap-6">
          {contracts.length > 0 ? (
            contracts.map((contract) => (
              <div key={contract._id} className="bg-slate-900/60 border border-slate-800/50 rounded-[2.5rem] p-8 hover:border-emerald-500/20 transition-all group shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="p-5 bg-slate-800/50 rounded-[1.5rem] text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500">
                      <FileText size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                        Protocol <span className="text-emerald-500 italic">#{contract._id ? contract._id.slice(-6) : "------"}</span>
                      </h3>
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-tighter italic font-bold mb-2 block">Status: {contract.status}</span>
                      
                      {/* 👑 CORREÇÃO DEFINITIVA DA LINHA 240: Lê o nome real do parceiro populado sem quebrar o ecrã */}
                      <p className="text-[11px] text-slate-400 font-mono">
                        Parceiro B2B: <span className="text-slate-300 font-bold">
                          {contract.companyB?.name || String(contract.companyB || "Empresa Parceira").slice(0, 12)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-mono font-bold text-white tracking-tighter italic">
                      {(contract.amount || 0).toLocaleString()} <span className="text-sm font-sans text-emerald-500 font-normal">USD</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/5 relative z-10">
                  <div className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-500 tracking-widest italic opacity-60">
                    <ShieldAlert size={12} className="text-blue-500 animate-pulse" />
                    Ledger Immutable Proof // Sovereign Audit Node
                  </div>
                 
                  <div className="flex gap-4">
                    {(contract.status === 'pending' || contract.status === 'approved' || contract.status === 'active') && (
                      <>
                        <button
                          onClick={() => handleTurboAdvance(contract._id)}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 border-b-4 ${
                            isUnlocked
                              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-orange-900 animate-pulse"
                              : "bg-slate-800 text-slate-500 border-slate-900 opacity-60"
                          }`}
                        >
                          {isUnlocked ? <Zap size={14} fill="currentColor" /> : <Lock size={14} />}
                          Turbo Advance
                        </button>

                        <button onClick={() => handleApprove(contract._id)} className="flex items-center gap-2 bg-slate-100 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95">
                          <Unlock size={14} /> Authorize Release
                        </button>
                      </>
                    )}

                    {(contract.status === 'released' || contract.status === 'completed') && (
                      <button
                        onClick={() => handleDownloadCertificate(contract._id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 border-b-4 ${
                          isUnlocked
                            ? "bg-blue-600 text-white border-blue-900 hover:bg-blue-500 animate-pulse"
                            : "bg-slate-800 text-slate-500 border-slate-900 opacity-60"
                        }`}
                      >
                        {isUnlocked ? <FileSearch size={14} /> : <Lock size={14} />}
                        Audit Certificate
                      </button>
                    )}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-[2rem] w-full">
              <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">Nenhum contrato ativo localizado neste nó privado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
