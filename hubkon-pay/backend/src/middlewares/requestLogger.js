const expressWinston = require('express-winston');
const logger = require('../config/logger');

module.exports = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: false,
  colorize: false,
  ignoreRoute: (req) => req.url === '/health' // ignora health check
});
