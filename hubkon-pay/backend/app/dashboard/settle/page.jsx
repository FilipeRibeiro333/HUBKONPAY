"use client";
import { useState } from "react";
import api from "../../services/api"; // O teu Axios master com cálculo automático de HMAC AppSec
import { ShieldCheck, UploadCloud, CheckCircle, Cpu, Globe, Wallet, FileText } from "lucide-react";

export default function SettleInvoicePage() {
  const [companyId] = useState("64f1a2b3c4d5e6f7a8b9c0d1");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [destinationCountry, setDestinationCountry] = useState("China");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierRequiresFiat, setSupplierRequiresFiat] = useState(false);
  const [digitalCurrencyUsed, setDigitalCurrencyUsed] = useState("USDC");
  const [attachedFile, setAttachedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [engineResponse, setEngineResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const numericAmount = Number(amount) || 0;
  const hubkonFee = numericAmount * 0.01;
  const netAmountToSupplier = numericAmount - hubkonFee;

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) setAttachedFile(file);
      else setErrorMessage("Apenas PDF, PNG ou JPG sao aceites.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setAttachedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrorMessage(""); setEngineResponse(null);
    if (!attachedFile) { setErrorMessage("Anexe a Fatura Comercial para prosseguir."); return; }
    setIsAnalyzing(true);

    const payload = {
      companyId,
      amount: numericAmount,
      currency,
      digitalCurrencyUsed: supplierRequiresFiat ? "NONE" : digitalCurrencyUsed,
      invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
      destinationCountry,
      supplierRequiresFiat,
      invoiceFileName: attachedFile.name
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const response = await api.post("/orchestration/settle-invoice", payload);
      setEngineResponse(response.data);
      setShowModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Falha critica na orquestracao.");
    } finally { setIsAnalyzing(false); }
  };
