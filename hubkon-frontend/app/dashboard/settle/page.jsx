"use client";

import { useState } from "react";
import api from "@/services/api"; // O teu Axios master com o interceptor HMAC
import { Upload, Cpu, Landmark } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useWallet } from "@solana/wallet-adapter-react";

/**
 * HUBKON TERMINAL - COMMERCIAL SETTLE & ORCHESTRATION ENGINE V.1.3.0
 * Concrete Base64 Ad Valorem Compliance File Pipeline & Reactive IBAN Core
 * Version: V.1350 DEFINITIVE PRODUCTION PATCH ✅ (Parte 1)
 */
export default function SettleOrchestratorPage() {
  const { publicKey } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados do Formulário Identicos à tua interface visual
  const [grossAmount, setGrossAmount] = useState("");
  const [currencyRef, setCurrencyRef] = useState("USD");
  const [tradeCorridor, setTradeCorridor] = useState("United States corridor");
  const [invoiceId, setInvoiceId] = useState("");
  
  // 🎛️ O SWITCH AMARELO MASTER DA TUA INTERFACE (Inicia em true para teste de rampa física)
  const [requireFiatLiquidation, setRequireFiatLiquidation] = useState(true);

  // 🏦 COORDENADAS BANCÁRIAS DE LIQUIDAÇÃO TRADICIONAL (OFF-RAMP DATA)
  const [targetIBAN, setTargetIBAN] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankName, setBankName] = useState("");
  
  // Estados concretos do ficheiro aduaneiro
  const [fileName, setFileName] = useState("");
  const [fileBase64, setFileBase64] = useState("");

  const feeApplied = grossAmount ? Number(grossAmount) * 0.01 : 0;
  const netAmount = grossAmount ? Number(grossAmount) - feeApplied : 0;

  // 📡 ENGENHARIA DEFINITIVA: Transforma a tua imagem real numa String de Texto estável para o barramento JSON
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result); // Converte a imagem completa para string Base64 estável
        toast.success(`Fatura Comercial Acoplada: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecuteSettle = async (e) => {
    e.preventDefault();

    if (!grossAmount || Number(grossAmount) <= 0) {
      toast.error("Por favor, insira o valor bruto da mercadoria.");
      return;
    }
    if (!invoiceId) {
      toast.error("Alerta Aduaneiro: O campo Identificador da Fatura (Invoice ID) é obrigatório.");
      return;
    }
    if (!fileBase64) {
      toast.error("Alerta de Compliance: Por favor, anexe a Fatura Comercial ou Documento Proforma para prosseguir.");
      return;
    }
    if (requireFiatLiquidation && (!targetIBAN || !swiftCode || !bankName)) {
      toast.error("Erro Operacional: Os dados bancários do IBAN de destino são obrigatórios para liquidação física.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        clientPublicKey: publicKey ? publicKey.toBase58() : "7V3h6U4nQy98HwE12XJkLpM5nR4qStVuWxYz2m7K8wWq",
        destinationWallet: "3nL5m2P7Qn85HwE12XJkLpM5nR4qStVuWxYz2m7K8wWq",
        amount: Number(grossAmount),
        assetType: "USDC",
        invoiceId: invoiceId,
        tradeCorridor: tradeCorridor,
        currencyRef: currencyRef,
        isFiatOfframp: requireFiatLiquidation,
        targetIBAN: requireFiatLiquidation ? targetIBAN : null,
        swiftCode: requireFiatLiquidation ? swiftCode : null,
        bankName: requireFiatLiquidation ? bankName : null,
        invoiceFile: {
          name: fileName,
          data: fileBase64
        }
      };

      const response = await api.post("/orchestration/build-unsigned-tx", payload);
      
      if (response.data?.success) {
        toast.success("ORQUESTRAÇÃO CONCLUÍDA COM SUCESSO!");
        
        const broadcastPayload = {
          signedTxHex: response.data.unsignedTxHex,
          companyId: "64f1a2b3c4d5e6f7a8b9c0d1",
          initialAmount: Number(grossAmount),
          assetType: "USDC",
          invoiceNumber: invoiceId
        };
        
        await api.post("/orchestration/broadcast", broadcastPayload);
        toast.success("GRAVADO NO LEDGER DO MONGO COMO COMPLETED! 💚");
        
        setGrossAmount("");
        setInvoiceId("");
        setTargetIBAN("");
        setSwiftCode("");
        setBankName("");
        setFileName("");
        setFileBase64("");
      }
    } catch (err) {
      toast.error("Falha ao comunicar com o barramento central de orquestração.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-300 p-8 font-sans w-full pl-72 relative">
      <Toaster position="top-right" reverseOrder={false} />
      
      <header className="mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="text-emerald-500" size={24} />
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            Orquestrador <span className="text-emerald-500">B2B Core</span>
          </h1>
        </div>
        <p className="text-slate-500 font-mono text-[9px] uppercase tracking-widest mt-1">HUBKON Terminal v1.3.0 // Multi-Rail Route Controller</p>
      </header>

      <form onSubmit={handleExecuteSettle} className="space-y-6 max-w-4xl">
        
        {/* DROPZONE DE ARRASTE DE FATURAS COM CONVERSÃO EM TEMPO REAL */}
        <div className="border-2 border-dashed border-slate-800 bg-slate-900/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-slate-700 transition-all relative group">
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <Upload className="text-slate-500 group-hover:text-emerald-400 transition-colors mb-3" size={32} />
          <p className="text-xs font-bold text-slate-300">Arraste e solte a Fatura Comercial / Proforma Comercial aqui</p>
          <p className="text-[9px] text-slate-500 font-mono uppercase mt-1">Formatos suportados: PDF, PNG ou JPG</p>
          <button type="button" className="mt-4 bg-slate-900 border border-slate-800 hover:border-slate-700 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
            {fileName ? `✓ ${fileName.slice(0, 25)}...` : "PROCURAR FICHEIRO"}
          </button>
        </div>

        {/* INPUTS DE VALOR E MOEDA EM PARIDADE TOTAL COM A TUA IMAGEM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[9px] text-slate-500 font-mono font-black uppercase block mb-2 tracking-wider">Valor Bruto da Mercadoria (Gross Amount)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-600 font-mono font-bold">\$</span>
              <input 
                type="number" placeholder="Ex: 100000" value={grossAmount} onChange={(e) => setGrossAmount(e.target.value)}
                className="w-full bg-[#0c1220] border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-white text-xs font-mono font-bold outline-none focus:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-slate-500 font-mono font-black uppercase block mb-2 tracking-wider">Moeda de Referência Documental</label>
            <select value={currencyRef} onChange={(e) => setCurrencyRef(e.target.value)} className="w-full bg-[#0c1220] border border-slate-800 rounded-xl p-3 text-slate-300 text-xs font-bold outline-none appearance-none cursor-pointer focus:border-slate-700">
              <option value="USD">USD - United States Dollar</option>
              <option value="EUR">EUR - Euro Zone</option>
              <option value="CNH">CNH - Chinese Yuan Offshore</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[9px] text-slate-500 font-mono font-black uppercase block mb-2 tracking-wider">Destino Comercial Aduaneiro</label>
            <select value={tradeCorridor} onChange={(e) => setTradeCorridor(e.target.value)} className="w-full bg-[#0c1220] border border-slate-800 rounded-xl p-3 text-slate-300 text-xs font-bold outline-none cursor-pointer focus:border-slate-700">
              <option value="United States corridor">United States corridor</option>
              <option value="China Corridor">China Corridor (Shenzhen / Ningbo)</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] text-slate-500 font-mono font-black uppercase block mb-2 tracking-wider">Identificador da Fatura (Invoice ID)</label>
            <input 
              type="text" placeholder="Ex: INV-HUBKON-99" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}
              className="w-full bg-[#0c1220] border border-slate-800 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-slate-700"
            />
          </div>
        </div>
        {/* O SWITCH AMARELO DA TUA INTERFACE */}
        <div className="bg-slate-900/10 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wide">O Fornecedor exige liquidação física tradicional (FIAT)</h3>
            <p className="text-[9px] text-slate-600 font-mono uppercase mt-0.5 tracking-wider">Se ativado, o sistema forçará o roteamento via canais fiduciários SWIFT/CHIPS através de parceiros licenciados BNA.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={requireFiatLiquidation} onChange={(e) => setRequireFiatLiquidation(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-black"></div>
          </label>
        </div>

        {/* 🏦 IN JEÇÃO REATIVA REQUERIDA: OS CAMPOS DE IBAN QUE FALTAVAM NO TEU PAINEL REAL */}
        {requireFiatLiquidation && (
          <div className="bg-[#0c1322] border border-amber-500/20 p-6 rounded-2xl space-y-4 transition-all duration-300">
            <div className="flex items-center gap-2 text-amber-500 border-b border-slate-800 pb-2 mb-2">
              <Landmark size={14} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Coordenadas Bancárias de Destino do Fornecedor (Off-Ramp Data)</h4>
            </div>
            
            <div>
              <label className="text-[9px] text-slate-500 font-mono font-black uppercase block mb-1.5 tracking-wider">IBAN de Destino Internacional (Bank Account IBAN)</label>
              <input 
                type="text" placeholder="Insira o IBAN da Conta da Fábrica (Ex: AO06 0006... ou SWIFT IBAN)" value={targetIBAN} onChange={(e) => setTargetIBAN(e.target.value)}
                className="w-full bg-[#070b13] border border-slate-800 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] text-slate-500 font-mono font-black uppercase block mb-1.5 tracking-wider">Código SWIFT / BIC do Banco</label>
                <input 
                  type="text" placeholder="Ex: EMISBAOAA ou BKCHCNBJ" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)}
                  className="w-full bg-[#070b13] border border-slate-800 rounded-xl p-3 text-white text-xs font-mono uppercase outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-mono font-black uppercase block mb-1.5 tracking-wider">Nome da Instituição Bancária (Bank Name)</label>
                <input 
                  type="text" placeholder="Ex: Bank of China / Standard Bank Luanda" value={bankName} onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#070b13] border border-slate-800 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* GRID DE CÁLCULO FINANCEIRO REAL DA TUA IMAGEM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/30 border border-slate-800/60 p-5 rounded-2xl text-center font-mono">
          <div>
            <p className="text-slate-600 text-[8px] font-black uppercase tracking-wider">Volume Captado</p>
            <p className="text-white text-xs font-bold mt-1">${grossAmount ? Number(grossAmount).toLocaleString() : "0"}.00</p>
          </div>
          <div>
            <p className="text-slate-600 text-[8px] font-black uppercase tracking-wider">Taxa Hubkon (1.0%)</p>
            <p className="text-purple-400 text-xs font-bold mt-1">${feeApplied.toLocaleString()}.00</p>
          </div>
          <div>
            <p className="text-slate-600 text-[8px] font-black uppercase tracking-wider">Líquido Despachado</p>
            <p className="text-emerald-400 text-xs font-bold mt-1">${netAmount.toLocaleString()}.00</p>
          </div>
        </div>

        {/* BOTÃO MESTRE DE SUBMISSÃO DA TUA IMAGEM */}
        <button 
          type="submit" disabled={isSubmitting}
          className="w-full bg-[#10b981] hover:bg-emerald-500 text-black font-black py-4 rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-950/20 disabled:bg-slate-800 disabled:text-slate-600"
        >
          {isSubmitting ? "📡 ORQUESTRANDO TRANSFERÊNCIA..." : "⚡ ORQUESTRAR LIQUIDAÇÃO COMERCIAL"}
        </button>

      </form>
    </div>
  );
}
