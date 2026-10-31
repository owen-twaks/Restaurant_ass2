// Test script for the Stripe integration.
const stripe = require('stripe');

console.log('typeof stripe:', typeof stripe);
console.log('stripe.checkout:', typeof stripe.checkout);
console.log('stripe.checkout.sessions:', typeof stripe.checkout.sessions);
console.log('stripe.VERSION:', stripe.VERSION);

// Try a simple session creation against the Stripe API (will only work
// if the secret key is set in the environment). In test mode this
// succeeds even with a fake key - Stripe just returns an error response
// we can inspect.
(async () => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      amount: 400,
      currency: 'usd',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Test Item' },
            unit_amount: 400,
          },
          quantity: 1,
        },
      ],
    });
    console.log('Stripe create session OK:', session.id, session.url);
  } catch (err) {
    console.log('Stripe create session error:', err.message);
    console.log('Stripe error type:', err.type);
    console.log('Stripe error code:', err.code);
    console.log('Stripe error param:', err.param);
  }
})();
