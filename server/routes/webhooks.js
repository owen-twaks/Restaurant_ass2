// ------------------------------------------------------------
// server/routes/webhooks.js
// One endpoint: POST /api/webhook
//
// What it does:
//   1. Reads the raw request body (Stripe needs the exact bytes)
//      - so it is registered BEFORE express.json().
//   2. Verifies the Stripe signature with the webhook secret.
//      - If the signature is wrong, we reply 400 and nothing else.
//   3. Handles checkout.session.completed -> marks the order 'paid'.
//   4. Is idempotent, so if Stripe sends the event twice (which happens
//      often in practice) we update the order exactly once.
// ------------------------------------------------------------

const express = require('express');
const db = require('../database');
const stripe = require('stripe');

// Load the webhook secret from the environment at runtime.
// server/.env.example shows the exact variable name. Never commit it.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Express router for /api/webhook.
const router = express.Router();

/**
 * POST /api/webhook
 *
 * Express 5 needs this middleware registered before we parse the body.
 * Stripe sends the raw body so it can verify the signature, so we read
 * the raw bytes and pass them to Stripe's secret-box verification.
 */
router.use(express.raw({ type: 'application/json' }));

router.post('/', async (req, res) => {
  // 1. Read the raw body once. Express 5 keeps the body as a Buffer here
  //    because we registered the raw parser above.
  const rawBody = req.body;

  // 2. The signature comes in a header Stripe writes for every event.
  const signature = req.headers['stripe-signature'];
  const event = null;

  // 3. Verify the signature. If the secret is missing, or the signature
  //    does not match, we reject the request. We never reply with any
  //    of Stripe's (or our) secrets in the response.
  if (!webhookSecret) {
    console.error('Webhook: STRIPE_WEBHOOK_SECRET is not set.');
    return res.status(500).json({ error: 'Server misconfigured.' });
  }

  try {
    // stripe.webhooks.constructEvent is the official Stripe helper. It
    // checks that the body was signed with the secret and the timestamp
    // header is inside the replay window, so old replayed events are
    // rejected automatically.
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    // Invalid signature - Stripe itself sent a bad request, so this
    // should not happen in normal operation. We do not reveal what went
    // wrong to the outside world.
    console.error('Webhook: signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  // 4. Handle the event types we care about. We ignore everything else
  //    and still reply 200, because Stripe only cares whether we
  //    understood (or at least read) the event.
  if (event.type === 'checkout.session.completed') {
    // Stripe passes us a session object. We use its id and client_reference_id
    // to find the order we created at checkout time.
    await handleCheckoutSessionCompleted(event.data.object);
  }

  // 5. Always reply 200 - Stripe expects that. We never send secrets.
  return res.json({ received: true });
});

/**
 * MARK THE ORDER AS PAID
 *
 * This is the only thing that changes the database after a payment.
 * We look up the order by stripe_session_id (the exact string Stripe
 * gave us), and if its status is still 'pending' we set it to 'paid'.
 * If it is already 'paid', we do nothing - this is the idempotency.
 */
async function handleCheckoutSessionCompleted(session) {
  const sessionId = session.id;
  const userId = session.client_reference_id;
  const itemId = null;

  // Find the order that belongs to this Stripe session.
  const orderResult = await db.query(
    `SELECT id, user_id, item_id, stripe_session_id, status
     FROM orders
     WHERE stripe_session_id = $1`,
    [sessionId]
  );

  if (orderResult.rows.length === 0) {
    // Stripe told us about a session we never created. This can happen
    // if a test session from an earlier version of your code is still in
    // Stripe's system. Nothing to do - we simply do not have an order.
    return;
  }

  const order = orderResult.rows[0];

  // Idempotency: only mark 'paid' if it is still 'pending'.
  // Stripe sometimes retries the same event, so we must not flip the
  // status to 'paid' twice and must not throw an error on the second.
  if (order.status === 'paid') {
    return;
  }

  try {
    await db.query(
      `UPDATE orders
       SET status = 'paid', user_id = $1
       WHERE id = $2`,
      [userId, order.id]
    );
  } catch (err) {
    console.error('Webhook: failed to update order:', err.message);
  }
}

module.exports = router;
