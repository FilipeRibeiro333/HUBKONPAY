// Middleware CORS básico
const cors = require('cors');

const corsOptions = {
  origin: '*', // permitir todas origens por enquanto (ajuste para produção)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

module.exports = cors(corsOptions);
