const express = require('express');
const router = express.Router();
const logger = require('../middlewares/logger');

router.get('/info', (req, res) => {
  logger.info('Log de teste INFO');
  res.json({ message: 'Log INFO enviado' });
});

router.get('/warn', (req, res) => {
  logger.warn('Log de teste WARN');
  res.json({ message: 'Log WARN enviado' });
});

router.get('/error', (req, res) => {
  logger.error('Log de teste ERROR');
  res.json({ message: 'Log ERROR enviado' });
});

router.get('/audit', (req, res) => {
  logger.audit('Log de teste AUDIT');
  res.json({ message: 'Log AUDIT enviado' });
});

module.exports = router;
