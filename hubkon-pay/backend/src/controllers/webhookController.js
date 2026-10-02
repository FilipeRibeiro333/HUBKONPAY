// src/controllers/webhookController.js
import Invoice from "../models/Invoice.js";

/**
 * Busca os últimos 10 logs de pagamento para o Dashboard
 */
export const getWebhookLogs = async (req, res) => {
    try {
        const logs = await Invoice.find({ status: "paid" })
            .sort({ updatedAt: -1 })
            .limit(10);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar logs", error: err.message });
    }
};

/**
 * Processa a confirmação de pagamento (Webhook)
 */
export const handleWebhook = async (req, res) => {
    const { invoiceId, amount } = req.body;

    if (!invoiceId || !amount) {
        return res.status(400).json({ message: "invoiceId e amount são obrigatórios" });
    }

    try {
        const invoice = await Invoice.findById(invoiceId);
        
        if (!invoice) {
            return res.status(404).json({ message: "Fatura não encontrada" });
        }

        // Validação de segurança: valor recebido vs valor esperado
        if (Number(invoice.amount) !== Number(amount)) {
            return res.status(400).json({ message: "Divergência de valores no pagamento" });
        }

        // Atualização da fatura
        invoice.status = "paid";
        invoice.paymentMethod = "bank-transfer";
        invoice.updatedAt = new Date();
        
        await invoice.save();

        res.json({ 
            message: "Pagamento confirmado via webhook com sucesso! ✅", 
            invoice 
        });
    } catch (err) {
        console.error("[WEBHOOK_ERROR]", err);
        res.status(500).json({ message: "Erro interno ao processar pagamento", error: err.message });
    }
};
