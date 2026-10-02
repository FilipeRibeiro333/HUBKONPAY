// src/middlewares/metrics.js
const logger = require('./logger');

function metrics(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
    };

    if (res.statusCode >= 400) {
      logger.warn('Route error', logData);
    } else {
      logger.info('Route success', logData);
    }
  });

  next();
}

module.exports = metrics;
