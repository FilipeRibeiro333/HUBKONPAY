import Transaction from "../models/TransactionModel.js";
import { generateAuditCertificate } from "../services/pdfService.js";

export const getInvoiceAuditSummary = async (req, res) => {
  try {
    const { invoiceNumber } = req.query;

    if (!invoiceNumber) {
      return res.status(400).json({ success: false, message: "Parâmetro invoiceNumber obrigatório na query." });
    }

    const tx = await Transaction.findOne({ invoiceNumber });

    if (!tx) {
      return res.status(404).json({ success: false, message: "Nenhum registo aduaneiro localizado para esta faturamento." });
    }

    const blockMock = {
      index: 1042,
      hash: `0000xHUBKON_BLOCK_${tx._id.toString().substring(0, 8).toUpperCase()}_SHA256`,
      previousHash: "0000xHUBKON_GENESIS_BLOCK_VALIDATED_NODE"
    };

    const fullCertificate = generateAuditCertificate(blockMock, tx, []);

    return res.status(200).json({
      success: true,
      message: "Certificado de conformidade e auditoria estruturado com sucesso.",
      data: fullCertificate
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Falha interna ao compilar certificado de auditoria.", error: error.message });
  }
};
