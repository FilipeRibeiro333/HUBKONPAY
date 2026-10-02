/**
 * 🏛️ HUBKON GLOBAL - INFRAESTRUTURA BANCÁRIA SOBERANA (V.1007 ELITE)
 * Padrão OpenAPI 3.0 - Protocolo de Grau Institucional & Multi-Tenancy
 * -----------------------------------------------------------------------
 * Este contrato define a interface de comunicação da Rede Hubkon,
 * integrando Custódia Criptográfica, Liquidação em Blockchain e Risco Dinâmico.
 */
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HUBKON GLOBAL - REDE FINANCEIRA SOBERANA',
      version: '1.0.0',
      description: `
        ### 🚀 Infraestrutura de Liquidez e Custódia B2B
        Plataforma **Multi-Tenant** de próxima geração para:
        *   **Smart Escrow:** Custódia segura com aprovação dupla.
        *   **Turbo Advance:** Antecipação de recebíveis (Factoring) com Regra 10X.
        *   **Sovereign Ledger:** Auditoria imutável via Blockchain Privada.
        *   **Multi-Currency:** Suporte nativo para USD, EUR e AOA.

        **Segurança:** Implementação de Zero-Trust, HMAC Signatures e RBAC.
      `,
      contact: { 
        name: 'Suporte Técnico Hubkon Global', 
        email: 'franciscaalexandrerosa@gmail.com',
        url: 'https://hubkonglobal.com'
      },
      license: {
        name: 'Propriedade Intelectual Privada - Licença de Operação Exclusiva',
      }
    },
    servers: [
      { url: 'https://api.hubkonglobal.com', description: '🌐 Gateway de Produção (Mainnet)' },
      { url: 'http://localhost:5000/api', description: '🛠️ Nó de Desenvolvimento (Sandbox)' }
    ],
    tags: [
      { name: 'Auth', description: 'Gestão de Identidade, Sessão e Refresh Tokens' },
      { name: 'Escrow', description: 'Motor de Custódia Inteligente e Condições de Pagamento' },
      { name: 'Advance', description: 'Operações de Antecipação e Gestão de Liquidez' },
      { name: 'Blockchain', description: 'Exploração de Blocos e Validação de Ledger' },
      { name: 'Company', description: 'Gestão de Tenants, Planos SaaS e API Keys' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { 
          type: 'http', 
          scheme: 'bearer', 
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login.'
        },
        apiKey: { 
          type: 'apiKey', 
          in: 'header', 
          name: 'x-api-key',
          description: 'Chave de acesso exclusiva da Empresa (Tenant).'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Mensagem de erro detalhada.' },
            code: { type: 'string', example: 'ERR_INSUFFICIENT_FUNDS' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            amount: { type: 'number' },
            currency: { type: 'string', enum: ['USD', 'EUR', 'AOA'] },
            status: { type: 'string', enum: ['pending', 'released', 'cancelled'] }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] },
      { apiKey: [] }
    ]
  },
  // Caminhos onde o swagger-jsdoc vai procurar as anotações JSDoc
  apis: ['./src/routes/*.js', './app.js'], 
};

export const swaggerSpec = swaggerJsdoc(options);
