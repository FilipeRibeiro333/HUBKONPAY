/**
 * 🏛️ HUBKON PAY - AUDIT CERTIFICATE TEST (THE 10M DIPLOMA)
 * ------------------------------------------------------
 * Objetivo: Validar a emissão do certificado com Assinatura Digital.
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Company from "../src/models/CompanyModel.js";
import Escrow from "../src/models/EscrowModel.js";
import Block from "../src/models/BlockModel.js";
import { getAuditCertificateController } from "../src/controllers/escrowController.js";

const runCertificateTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ [DB] Conectado para Emissão de Certificado de Elite\n");

    // 1. Localizar o último contrato Enterprise (Aquele de $50k que selamos)
    const escrow = await Escrow.findOne({ amount: 50000 }).sort({ createdAt: -1 });
    
    if (!escrow) {
      throw new Error("Contrato Enterprise não encontrado. Corre o 'testEnterpriseSmartContract.js' primeiro!");
    }

    // 2. Simular o pedido do Controlador (Mock do Express)
    const req = { params: { id: escrow._id } };
    const res = {
      status: (code) => ({ json: (data) => console.log(`HTTP ${code}:`, data) }),
      json: (data) => {
        const cert = data.certificate;
        console.log("============================================");
        console.log(`📜 ${cert.header.title}`);
        console.log(`🔒 NETWORK: ${cert.header.network}`);
        console.log("============================================");
        console.log(`🏢 COMPRADOR:  ${cert.contract.buyer}`);
        console.log(`🏢 VENDEDOR:   ${cert.contract.seller}`);
        console.log(`💰 VALOR:      ${cert.contract.amount}`);
        console.log(`💸 TAXA:       ${cert.contract.fee}`);
        console.log("--------------------------------------------");
        console.log(`🧱 BLOCO:      ${cert.proof.blockIndex}`);
        console.log(`🔗 HASH TX:    ${cert.proof.transactionHash}`);
        console.log(`⚖️  ASSINATURA: ${cert.proof.validatorSignature}`);
        console.log("============================================");
        console.log(`📝 NOTA LEGAL: ${cert.legalNote}`);
        console.log("============================================\n");
      }
    };

    console.log(`📡 Solicitando Certificado para Escrow ID: ${escrow._id}...`);
    await getAuditCertificateController(req, res);

    await mongoose.disconnect();
    console.log("🔌 Sistema finalizado. O teu cliente tem agora a prova real.");

  } catch (err) {
    console.error("❌ Falha na Emissão:", err.message);
    process.exit(1);
  }
};

runCertificateTest();
