const express = require('express');
const router = express.Router();

const stripeGateway = require('../gateways/stripeGateway');
const localGateway = require('../gateways/localGateway');

router.post('/pay', async (req, res) => {
  const { amount, currency, method } = req.body;

  try {
    let payment;

    if (method === 'stripe') {
      payment = await stripeGateway.createPayment(amount, currency);
    } else if (method === 'local') {
      payment = await localGateway.createPayment(amount, currency);
    } else {
      return res.status(400).json({ error: 'Método de pagamento inválido' });
    }

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
