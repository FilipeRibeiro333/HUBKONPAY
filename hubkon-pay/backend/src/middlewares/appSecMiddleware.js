/**
 * @file appSecMiddleware.js
 * @description Layered Security - HMAC-SHA256 Payload Integrity Verifier.
 * Version: V.1051 ELITE - AppSec Armor Patch.
 */
import crypto from 'crypto';

export const verifyPayloadIntegrity = (req, res, next) => {
  try {
    // Captura a assinatura criptográfica enviada pelo cliente no Header
    const clientSignature = req.headers['x-hubkon-signature'];
    
    if (!clientSignature) {
      return res.status(401).json({
        success: false,
        message: "Acesso bloqueado [AppSec]: Assinatura de integridade (x-hubkon-signature) em falta no Header."
      });
    }

    // Lemos a chave secreta master do teu .env (ou usamos um fallback seguro para testes locais)
    const secret = process.env.HMAC_SECRET || "HUBKON_SUPER_SECRET_COMPLIANCE_KEY_2026";

    // Convertemos o corpo da requisição (Body JSON) numa string de dados linear estável
    const payloadString = JSON.stringify(req.body);

    // Geramos o hash HMAC-SHA256 local utilizando a nossa chave secreta trancada no servidor
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    // Verificação forense: Compara a assinatura calculada com a enviada pelo cliente
    if (clientSignature !== computedSignature) {
      console.error("🚨 [SECURITY ALERT] Tentativa de manipulação de payload detetada nas rotas de Orquestração!");
      return res.status(403).json({
        success: false,
        message: "Acesso negado [AppSec]: Assinatura inválida. Os dados da fatura foram adulterados em trânsito."
      });
    }

    // Se as assinaturas forem milimetricamente idênticas, o tráfego é libertado para o controlador
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Falha interna no escudo criptográfico AppSec.",
      error: error.message
    });
  }
};
