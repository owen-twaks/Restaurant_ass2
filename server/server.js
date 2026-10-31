// ------------------------------------------------------------
// server/server.js
// The entry point of the backend (Express server).
// It starts the database, creates the Express app, defines the
// API routes, and exports the app so Vercel can run it.
// ------------------------------------------------------------

// Load the .env file FIRST, before anything else reads environment variables.
require('dotenv').config();

// Import the Express library. Express is a small web framework for Node.js.
// It makes it easy to create routes (URLs) and send back JSON data.
const express = require('express');

// Import the Stripe module. We keep the key out of the source code:
// server/.env.example lists the exact variable name, and the real key
// is only ever read from process.env.STRIPE_SECRET_KEY (see server/.env).
// Never log this key, never commit it.
const stripe = require('stripe');

// Import the database setup (create table + seed data + register routes).
const setup = require('./db-setup');
const db = require('./database');

// Create the Express app we will use for everything.
const app = express();

// The port the server listens on.
// process.env.PORT is set by Vercel automatically when it runs
// this function. If it is not set (running locally), we fall back
// to port 5000.
const PORT = process.env.PORT || 5000;

// Start the database setup and route registration together.
// We pass the app we just created so the routes end up on it.
setup(app)
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });

// The simplest route: when someone visits the main page
// (http://localhost:5000/), send back a JSON message.
// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------
app.get('/', (req, res) => {
  // Send a JSON response back to the browser.
  res.json({ message: 'Bella Tavola backend is running' });
});

// ------------------------------------------------------------
// ERROR HANDLING (Express 5 needs this for async routes)
// When a route throws an error (for example, if the database
// query fails), Express 5 does not auto-send a response.
// This middleware catches those errors and sends a JSON message
// instead of a blank page.
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
});

// Make sure JSON bodies are parsed for the next stages (login, signup).
app.use(express.json());

// IMPORTANT: the webhook endpoint must be registered BEFORE express.json().
// Stripe sends the raw request body (the exact bytes) so Stripe can check
// the signature with its secret. If we parsed the body here the raw bytes
// would be gone and the signature check would fail.
app.use('/api/webhook', require('./routes/webhooks'));

// Register the orders schema before the routes start (it is idempotent).
const { createOrdersSchema } = require('./orders');
(async () => {
  try {
    await createOrdersSchema();
    console.log('Orders table ready.');
  } catch (err) {
    console.error('Failed to create orders table:', err.message);
  }
})();

// Register the checkout route. This reads the item price from the database
// (never from the client) and creates the Stripe session.
const checkoutRouter = require('./routes/checkout');
app.post('/api/checkout', checkoutRouter.handleCheckout);

// Allow the React client to call this API. The client runs on a
// different origin (another port now, another domain when deployed),
// so the browser blocks requests unless the server explicitly allows
// them. `credentials: true` is required for session cookies, and with
// it the origin must be named exactly - never use "*" with cookies.
const cors = require('cors');
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Trust the first proxy header. Needed so "secure" cookies work
// once we deploy behind a hosting proxy. Harmless locally.
app.set('trust proxy', 1);

// Better Auth handles everything under /api/auth: sign-up, sign-in,
// get-session, sign-out and password reset. toNodeHandler converts
// Express's request into the format Better Auth expects; Express
// strips the /api/auth prefix and the handler puts it back.
const { auth } = require('./auth');
const { toNodeHandler } = require('better-auth/node');
app.use('/api/auth', toNodeHandler(auth));

// The database connection must be created AFTER the app is ready
// because db-connect() awaits the pool. The routes need the pool
// to be connected.
(async () => {
  try {
    await db.connect();
    console.log('Database connected. Routes are ready.');
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
  }
})();

// Start the server.
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Export the app for Vercel's serverless runtime.
module.exports = app;
