/**
 * @file errorHandler.js
 * @description Global Exception Interceptor & Security Shield.
 */
import logger from './logger.js';

const errorHandler = (err, req, res, next) => {
  // 1. Registro Seguro na Auditoria
  try {
    logger.error('SYSTEM_FAULT', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      requestId: req.headers['x-request-id'] || 'N/A'
    });
  } catch (logError) {
    console.error('FAILED_TO_LOG_ERROR:', logError);
  }

  // 2. Prevenção de estouro de resposta
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;

  // 3. Resposta Sanitizada (Blindagem contra Fingerprinting)
  res.status(statusCode).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: statusCode === 500 
      ? 'Ocorreu um erro interno de processamento. Contacte o suporte Hubkon.' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { dev_details: err.message })
  });
};

export default errorHandler;

