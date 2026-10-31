// ------------------------------------------------------------
// server/orders.js
// Handles the new "orders" table used for Stripe payments.
// ------------------------------------------------------------

// Import the database connection we created in database.js.
const db = require('./database');

// ------------------------------------------------------------
// CREATE THE orders TABLE
// ------------------------------------------------------------
// SQL: create the table only if it doesn't already exist.
//   id           SERIAL PRIMARY KEY   -> unique number for each order
//   user_id      BIGINT (nullable)    -> the signed-in user who paid (NULL when no one is signed in)
//   item_id      INTEGER              -> the menu item that was bought (references menu_items.id)
//   stripe_session_id TEXT UNIQUE    -> Stripe's session id, so we can find the order later
//   status       TEXT                 -> 'pending' (waiting) or 'paid' (charge confirmed)
//   created_at   TIMESTAMPTZ DEFAULT NOW()
//
// The user_id column is a foreign key to "users", but PostgreSQL will not
// create a foreign key unless the referenced table already exists. Better
// Auth creates "users" for us, so we only add the constraint when that
// table is there. createOrdersSchema() below waits for it.
const createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    item_id INTEGER NOT NULL,
    stripe_session_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

// ------------------------------------------------------------
// ADD A FOREIGN KEY (so user_id always points to a real user)
// ------------------------------------------------------------
// PostgreSQL needs the referenced table to exist before it can add a
// foreign key. Better Auth creates the users table for us, so we only
// add the constraint once that table exists. This is an idempotent
// ALTER, so it is safe to run on every server start.
async function createOrdersForeignKey() {
  await db.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE orders
        ADD CONSTRAINT orders_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END
    $$;
  `);
}

// ------------------------------------------------------------
// SEED: add a placeholder order row so the table exists even before
// anyone checks out. We use the first menu item as a stand-in; it is
// never read by the app, so this can never break a real checkout.
// ------------------------------------------------------------
const seedOrdersPlaceholder = `
  INSERT INTO orders (item_id, status)
  SELECT 1, 'pending'
  WHERE NOT EXISTS (SELECT 1 FROM orders)
`;

// ------------------------------------------------------------
// THE PUBLIC API
// ------------------------------------------------------------

// Run everything once when the server starts (it is idempotent, so it
// is safe to call on every start). If the users table does not exist
// yet, the foreign key is skipped and Better Auth will add it later.
async function createOrdersSchema() {
  await db.query(createOrdersTable);
  await createOrdersForeignKey();
  await db.query(seedOrdersPlaceholder);
}

module.exports = {
  createOrdersSchema,
};
