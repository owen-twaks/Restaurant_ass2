// ------------------------------------------------------------
// server/auth.js
// This file sets up Better Auth: the library that handles signing
// up, signing in and session cookies. Users, sessions and accounts
// are stored in our existing Neon Postgres database.
// ------------------------------------------------------------

// Read server/.env FIRST, so DATABASE_URL, BETTER_AUTH_SECRET and
// BETTER_AUTH_URL exist before anything uses them. The explicit path
// means it works no matter which folder you start the server from.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Better Auth does the heavy lifting (password hashing, sessions, cookies).
const { betterAuth } = require('better-auth');

// Our existing Neon connection pool (the same one the menu uses).
// Passing the pool directly is the documented way to plug Postgres in.
const db = require('./database');

// Create the auth object. Every auth route is built from this config.
const auth = betterAuth({
  // The address of THIS server. Better Auth builds links from it
  // (for example the password-reset link) and decides cookie rules.
  baseURL: process.env.BETTER_AUTH_URL,

  // A long random secret used to sign session cookies so nobody can
  // forge one. Private - it only ever lives in server/.env.
  secret: process.env.BETTER_AUTH_SECRET,

  // Origins (client addresses) allowed to call the auth routes.
  // baseURL alone is not enough: the React app runs on another
  // origin (another port now, another domain when deployed), and
  // Better Auth rejects any origin that is not listed here.
  trustedOrigins: [process.env.CLIENT_ORIGIN || 'http://localhost:5173'],

  // Where rows are stored: our Neon Postgres database, via the pg pool.
  database: db,

  // Only email + password sign-in is enabled - no social logins.
  emailAndPassword: {
    enabled: true,

    // PASSWORD RESET (demo): we have no email service, so instead of
    // emailing the reset link we print it in this server's terminal.
    // A REAL deployment would send `url` by email using an email
    // provider such as Resend - printing to the terminal is only a
    // stand-in for this coursework demo.
    sendResetPassword: async ({ user, url }) => {
      console.log('');
      console.log('==========================================================');
      console.log(` PASSWORD RESET (demo - would be emailed to ${user.email})`);
      console.log(` ${url}`);
      console.log('==========================================================');
      console.log('');
    },
  },
});

module.exports = { auth };