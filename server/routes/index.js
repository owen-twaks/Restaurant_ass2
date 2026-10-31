// ------------------------------------------------------------
// server/routes/index.js
// Re-exports the route handlers so server.js can require them in one place.
// ------------------------------------------------------------

const checkout = require('./checkout');
const webhooks = require('./webhooks');

module.exports = {
  checkout: checkout.handleCheckout,
  webhooks: webhooks,
};
