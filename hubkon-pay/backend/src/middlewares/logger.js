/**
 * @file logger.js
 * @description Centralized Logging Engine for HUBKON PAY.
 */
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Captura stack trace automaticamente
    format.json()
  ),
  defaultMeta: { service: 'hubkon-master-engine' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
});

// Extensão para trilha de auditoria financeira/segurança
logger.audit = (msg, meta = {}) => {
  logger.log({ level: 'info', message: `[AUDIT] ${msg}`, ...meta });
};

export default logger;
