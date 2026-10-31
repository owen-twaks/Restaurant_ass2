// ------------------------------------------------------------
// server/api.js
// This file defines the API routes (the endpoints the front end
// will ask the server for).
//
// Right now it only has one route:
//   GET /api/menu   -> returns the full menu as JSON
// ------------------------------------------------------------

// Import the database connection we created in database.js.
// We use it to run SQL queries inside the route handlers.
const db = require('./database');

// Wait for the connection to be ready before registering routes.
// This is important because the pool needs time to connect to the
// database before we can run any queries.
(async () => {
  try {
    await db.connect();
    console.log('Database connected. Routes are ready.');
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
  }
})();

// ------------------------------------------------------------
// REGISTER ROUTES
// ------------------------------------------------------------
// This function is called by server.js and gets the Express 'app'
// so we can add our routes to it.
function registerRoutes(app) {
  console.log('registerRoutes: adding /api/menu route to app');

  console.log('api.js: registering GET /api/menu route');

  app.get('/api/menu', async (req, res) => {
    try {
      // Ask Postgres for every dish in the menu_items table.
      const result = await db.query(
        'SELECT id, name, category, description, price, image, available FROM menu_items ORDER BY id'
      );

      // Send the dishes back as JSON.
      // NOTE: we return here so the async function stops running.
      return res.json(result.rows);
    } catch (err) {
      // If something goes wrong, send a 500 error with a message.
      console.error('Error fetching menu:', err.message);
      // NOTE: we return here so the async function stops running.
      return res.status(500).json({ error: 'Could not load the menu. Please try again later.' });
    }
  });

  console.log('api.js: /api/menu route registered');
  console.log('app._router:', app._router ? 'exists' : 'undefined');
  console.log('app.router:', typeof app.router);
}

// Export the function so server.js can call it.
module.exports = registerRoutes;
