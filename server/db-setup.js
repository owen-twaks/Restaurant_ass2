// ------------------------------------------------------------
// server/db-setup.js
// Runs the database setup when the server starts.
// Creates the table, seeds the data, then hands the app back so
// server.js can start it.
//
// We require this file at the top of server.js:
//   node server.js
// It then sets up the database and registers the routes.
// ------------------------------------------------------------

// Import the database connection we created in database.js.
const db = require('./database');

// ------------------------------------------------------------
// Create the menu_items table
// ------------------------------------------------------------
// SQL: create the table only if it doesn't already exist.
//   id SERIAL PRIMARY KEY        ->  unique number for each dish
//   name TEXT                    ->  the dish name, like "Bruschetta"
//   category TEXT                ->  which group it belongs to
//   description TEXT             ->  a short text description
//   price TEXT                   ->  the price, like "7.50"
//   image TEXT                   ->  the URL of the picture
//   available BOOLEAN            ->  true or false: is the dish on the menu?
// ------------------------------------------------------------
const createTable = `
  CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT NOT NULL,
    available BOOLEAN NOT NULL DEFAULT true
  )
`;

// ------------------------------------------------------------
// Seed the database with the 9 menu items
// ------------------------------------------------------------
// INSERT INTO ... VALUES ...  ->  adds new rows into the table.
// We add 9 rows, one for each dish. Each row has:
//   name, category, description, price, image, available
// ------------------------------------------------------------
const seedData = `
  INSERT INTO menu_items (name, category, description, price, image, available) VALUES
  ('Bruschetta', 'Starters', 'Toasted bread with tomatoes, garlic and basil.', '7.50', 'https://images.pexels.com/photos/5638527/pexels-photo-5638527.jpeg', true),
  ('Caesar Salad', 'Starters', 'Fresh lettuce, parmesan, caesar dressing.', '8.50', 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg', true),
  ('Tomato Soup', 'Starters', 'Classic tomato soup with fresh herbs.', '6.50', 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg', true),
  ('Grilled Chicken', 'Main Courses', 'Served with vegetables and potatoes.', '14.50', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', true),
  ('Pasta Carbonara', 'Main Courses', 'Creamy sauce, pancetta, parmesan.', '13.50', 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg', true),
  ('Risotto', 'Main Courses', 'With mushrooms and herbs.', '13.00', 'https://images.pexels.com/photos/5638531/pexels-photo-5638531.jpeg', true),
  ('Tiramisu', 'Desserts', 'Classic Italian dessert with coffee.', '6.50', 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg', true),
  ('Cheesecake', 'Desserts', 'With berry sauce.', '5.50', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true),
  ('Panna Cotta', 'Desserts', 'With fresh berries.', '6.00', 'https://images.pexels.com/photos/114979/pexels-photo-114979.jpeg', true)
`;

// ------------------------------------------------------------
// The main setup function. It does the database work and then
// registers the API routes on the app that server.js owns.
// ------------------------------------------------------------
async function setup(app) {
  try {
    // Step 1: Connect to the database
    try {
      await db.connect();
      console.log('Connected to Postgres (Neon) database');
    } catch (err) {
      console.error('db.connect() error:', err.message);
      process.exit(1);
    }

    // Step 2: Create the table
    await db.query(createTable);
    console.log('Created / verified menu_items table');

    // Step 3: Seed the data idempotently — clear any existing rows
    // first so repeated runs never duplicate dishes.
    await db.query('DELETE FROM menu_items');
    await db.query(seedData);
    console.log('Seeded 9 menu items into the database');

    // Register the API routes (menu) on the app we were given.
    require('./api')(app);

    // Return the app so server.js can use it.
    return app;
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
}

// Log any pool errors so we know if the database connection breaks.
db.on('error', (err) => {
  console.error('Database pool error:', err.message);
  process.exit(1);
});

// Export the setup function so server.js can call it.
module.exports = setup;
