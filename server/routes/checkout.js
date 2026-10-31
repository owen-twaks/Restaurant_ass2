// ------------------------------------------------------------
// server/routes/checkout.js
// One endpoint: POST /api/checkout
//
// What it does:
//   1. Reads the item id from the request body (the client cannot be
//      trusted, and cannot change the price).
//   2. Loads the item AND its price FROM THE DATABASE. This is the
//      single source of truth - we never accept a price from the
//      browser.
//   3. Creates a Stripe Checkout Session in "payment" mode.
//   4. Saves a 'pending' order in the orders table (linked to the
//      signed-in user when there is one).
//   5. Returns { url } so the browser can open the Stripe checkout page.
// ------------------------------------------------------------

// Load the database connection.
const db = require('../database');

// Load the Stripe module. We keep the key out of this source file:
// server/.env.example lists the exact variable name, and the real key
// is only ever read from process.env.STRIPE_SECRET_KEY (see server/.env).
// Never log this key, never commit it.
const stripe = require('stripe');
const dotenv = require('dotenv');

// Load server/.env FIRST, so STRIPE_SECRET_KEY exists before we read it.
dotenv.config({ path: require('path').join(__dirname, '.env') });

// The stripe module exports a function (the Stripe constructor). When you
// call it with an API key it creates an instance that exposes the full
// API. The secret key is read from the environment (server/.env), never
// from this source file. In test mode the key starts with sk_test_.
//
// We instantiate the client here with the API version Stripe uses today.
// The instance then exposes the Checkout Sessions operations at
//   stripe.checkout.sessions.create({ mode, amount, currency, ... })
// If the secret key is missing, we still create the client (it will just
// fail at runtime), so the checkout route can still serve its other jobs
// (loading the item, saving the order).
let stripeClient;
try {
  stripeClient = stripe(
    process.env.STRIPE_SECRET_KEY,
    { apiVersion: process.env.STRIPE_API_VERSION || '2024-06-24' }
  );
} catch (err) {
  console.error('Checkout: could not create Stripe client:', err.message);
  stripeClient = null;
}

// The public URL of the frontend. Set this to the production Vercel URL
// in production. The browser knows where this is, so it is not a secret.
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * POST /api/checkout
 * Body: { itemId: 3 }
 *
 * Returns: { url: "https://checkout.stripe.com/..." }
 */
async function handleCheckout(req, res) {
  // 1. Read and validate the item id from the body.
  const { itemId } = req.body || {};

  if (!itemId || typeof itemId !== 'number' || !Number.isInteger(itemId)) {
    return res
      .status(400)
      .json({ error: 'Missing or invalid "itemId". Send { itemId: 3 }' });
  }

  // 2. Load the item and its price FROM THE DATABASE.
  //    This is the single source of truth. Never trust the price the
  //    client sends us - it could be edited in DevTools to $0.01.
  let item;
  try {
    const result = await db.query(
      'SELECT id, name, price FROM menu_items WHERE id = $1',
      [itemId]
    );
    item = result.rows[0];
  } catch (err) {
    console.error('Checkout: failed to load item from database:', err.message);
    return res
      .status(500)
      .json({ error: 'Could not load the item. Please try again.' });
  }

  if (!item) {
    // Clean 404 - the id exists in the request but no dish with that id
    // is in the database.
    return res
      .status(404)
      .json({ error: 'Item not found. Please check the id and try again.' });
  }

  // 3. Convert the price "7.50" (a string in our database) into cents.
  //    Stripe wants whole cents, not dollars. 7.50 dollars = 750 cents.
  const priceCents = Math.round(parseFloat(item.price) * 100);

  if (priceCents <= 0) {
    return res
      .status(400)
      .json({ error: 'The item price is not valid for checkout.' });
  }

  // 4. Create the Stripe Checkout Session.
  //    If the Stripe client could not be created, we reply with a clean
  //    502 and a friendly message.
  if (!stripeClient) {
    return res
      .status(502)
      .json({ error: 'Could not create the checkout session. Please try again.' });
  }

  let session;
  try {
    // The Stripe SDK (v18) exposes the Checkout Sessions operations on
    // the `checkout.sessions` namespace of the client instance. This is
    // the only place we talk to Stripe - it needs the secret key from
    // the environment (loaded from server/.env). In test mode the key
    // is sk_test_...
    session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      // The exact amount we read from the database (in cents) - never a
      // number the client sent us.
      amount: priceCents,
      currency: 'usd',
      // Where Stripe sends the customer after a successful payment.
      // {CHECKOUT_SESSION_ID} is replaced by Stripe with the session id.
      success_url:
        `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&item_id=${itemId}`,
      // Where Stripe sends the customer if they cancel.
      cancel_url: `${CLIENT_URL}/cancel`,
      // What the customer is buying. We use it only for display on the
      // payment page - never to calculate the price.
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: String(item.id),
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      // If the user is signed in, we keep the order linked to them by
      // sending their id as client_reference_id. The webhook uses this
      // to write the order with the right user_id.
      client_reference_id:
        req.session && req.session.userId ? String(req.session.userId) : null,
    });
  } catch (err) {
    console.error('Checkout: failed to create Stripe session:', err.message);
    return res
      .status(502)
      .json({ error: 'Could not create the checkout session. Please try again.' });
  }

  // 5. Save a 'pending' order in our database. It stays 'pending' until
  //    the webhook confirms the payment.
  let order;
  try {
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, item_id, stripe_session_id, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, user_id, item_id, stripe_session_id, status, created_at`,
      [
        req.session && req.session.userId ? req.session.userId : null,
        itemId,
        session.id,
      ]
    );
    order = orderResult.rows[0];
  } catch (err) {
    console.error('Checkout: failed to save order:', err.message);
    // If the order write fails we still return the Stripe URL and let
    // the webhook handle it afterwards. The customer is not blocked.
    return res.json({ url: session.url });
  }

  // Done - return the Stripe URL. The browser opens this in a popup and
  // Stripe takes over the payment page.
  return res.json({ url: session.url, orderId: order.id });
}

module.exports = { handleCheckout };
