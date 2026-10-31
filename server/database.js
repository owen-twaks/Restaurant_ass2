// ------------------------------------------------------------
// server/database.js
// This file creates a connection to the Postgres database.
// We use a "pool" because it is the safest and fastest way
// for Node.js to talk to a database: it reuses the same
// connection instead of opening a new one for every request.
// ------------------------------------------------------------

// Import the official Postgres driver for Node.js.
const { Pool } = require('pg');

// The connection string Neon gave us. Keep the standard PostgreSQL
// connection string and let the driver pick the right TLS mode.
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon requires TLS. Node ships with modern TLS support so rejectUnauthorized:false
  // is enough for a local dev connection; a hosting platform sets this for us.
  ssl: { rejectUnauthorized: false }
});

// Export the pool plus a helper to await the connection.
module.exports = db;
module.exports.connect = db.connect.bind(db);

// Log any pool errors so we know if the database connection breaks.
db.on('error', (err) => {
  console.error('Database pool error:', err.message);
  process.exit(1);
});
