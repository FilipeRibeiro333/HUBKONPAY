const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Cria um pagamento no Stripe
 * @param {number} amount - Valor em centavos (ex: 1000 = 10 USD)
 * @param {string} currency - Moeda (ex: 'usd')
 * @param {string} description - Descrição do pagamento
 * @returns {Promise<Object>} - Objeto do Stripe PaymentIntent
 */
async function createPayment(amount, currency = 'usd', description = '') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description
    });
    return paymentIntent;
  } catch (err) {
    console.error('Erro Stripe:', err);
    throw err;
  }
}

module.exports = {
  createPayment
};
