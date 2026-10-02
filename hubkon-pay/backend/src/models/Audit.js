/**
 * @file Audit.js
 * @description Modelo de Auditoria Soberana - Versão Final Unificada.
 */
import mongoose from 'mongoose';

const AuditSchema = new mongoose.Schema({
  action: { type: String, required: true },     // Ex: "TURBO_ADVANCE", "CONTRACT_APPROVED"
  invoiceId: { type: String, index: true },     // ID do contrato (Fundamental para o PDF)
  user: { type: String, required: true },      // Nome ou E-mail do utilizador
  status: { type: String, default: "SUCCESS" }, // Status da ação
  details: { type: Object, default: {} },       // Metadados extras
  timestamp: { type: Date, default: Date.now }
});

// ✅ Exportação compatível com ESM (Resolve o erro do Node.js)
const Audit = mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
export default Audit;
