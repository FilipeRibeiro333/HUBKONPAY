const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../middlewares/logger');

router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date(),
  };

  logger.info('Health check requested', { health });

  res.status(200).json(health);
});

module.exports = router;
