// ------------------------------------------------------------
// client/src/AuthModal.jsx
// The sign-in / create-account pop-up shown from the header, plus
// the "Forgot password?" request form. It talks to the Better Auth
// routes on the Express server (sign-up, sign-in, reset link).
// ------------------------------------------------------------

import { useState } from "react"
import "./index.css"

// Where the Express server lives. VITE_SERVER_URL can override it
// (for example when we deploy client and server to different domains).
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"

// Turn the server's error code into a short human message.
function friendlyError(data) {
  // Better Auth names this code USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL.
  if (data.code && data.code.startsWith("USER_ALREADY_EXISTS"))
    return "An account with this email already exists."
  if (data.code === "PASSWORD_TOO_SHORT" || data.code === "INVALID_PASSWORD")
    return "Password must be at least 8 characters."
  if (data.code === "NAME_TOO_SHORT")
    return "Please enter your name."
  if (data.code === "INVALID_EMAIL")
    return "Please enter a valid email address."
  return data.message || "Something went wrong. Please try again."
}

// isOpen tells us whether the pop-up is on screen; onClose closes it.
// onAuthSuccess tells the Header "the user is signed in now" so it
// can swap the Sign In button for the user's name.
function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // Which tab is showing: "signin" (email + password) or "signup" (name + email + password).
  const [tab, setTab] = useState("signin")

  // The values the user types into the form fields.
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Error message shown in red inside the modal (empty = no error).
  const [error, setError] = useState("")

  // Informational message (green), used by "Forgot password?".
  const [info, setInfo] = useState("")

  // Nothing rendered at all when the pop-up is closed.
  if (!isOpen) return null

  // Sending the form: create the account, sign in, or request the
  // reset link, depending on which view is showing.
  const handleSubmit = (e) => {
    e.preventDefault()
    if (tab === "forgot") {
      handleForgot()
    } else if (tab === "signup") {
      handleSignUp()
    } else {
      handleSignIn()
    }
  }

  // Forgot password: ask the server to create a reset token (saved in
  // the Neon "verification" table). We have no email service, so the
  // server prints the reset link in its terminal instead of emailing it.
  const handleForgot = async () => {
    setError("")
    setInfo("")
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          // Where the link should bring the user: this app's
          // "set new password" page (the server redirects there).
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      })

      if (!res.ok) {
        setError("Could not send the reset link. Please try again.")
        return
      }

      // The server always answers "maybe" so strangers cannot use the
      // form to discover which emails have accounts.
      setInfo(
        "If that email exists, the reset link was printed in the server terminal " +
          "(demo - no email service configured)."
      )
    } catch {
      setError("Could not reach the server. Is it running?")
    }
  }

  // Sign in: send email + password to the server, which checks them
  // against the "account" table in Neon (comparing the password hash).
  const handleSignIn = async () => {
    setError("")
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Include the session cookie so a successful sign-in is stored.
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        // Wrong email or wrong password - same message for both,
        // so a stranger cannot learn which emails have accounts.
        setError("Incorrect email or password.")
        return
      }

      // Success: the server created a session and sent the cookie.
      // Let the Header know, then close the pop-up.
      onAuthSuccess()
      onClose()
    } catch {
      // The fetch itself failed - most often the server is not running.
      setError("Could not reach the server. Is it running?")
    }
  }

  // Create account: POST name/email/password to the server.
  // Better Auth hashes the password, inserts a row into the Neon
  // "user" table, then creates a session row and sends back the
  // session cookie (so the user is signed in straight away).
  const handleSignUp = async () => {
    setError("")
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // "include" lets the browser accept and store the session
        // cookie coming from the server's different origin.
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        // Something went wrong (email already used, password too short...).
        setError(friendlyError(data))
        return
      }

      // Success: the row is in Neon and the session cookie is set.
      // Let the Header know, then close the pop-up.
      onAuthSuccess()
      onClose()
    } catch {
      // The fetch itself failed - most often the server is not running.
      setError("Could not reach the server. Is it running?")
    }
  }

  return (
    // Full-screen backdrop: clicking anywhere OUTSIDE the card closes the pop-up.
    <div className="auth-overlay" onClick={onClose}>
      {/* The card itself. stopPropagation stops the click above from
          firing when the user clicks inside the card. */}
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>

        {/* Clear close button (top right corner). */}
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* "Forgot password?" shows a third view: enter your email. */}
        {tab === "forgot" ? (
          <>
            <h2 className="auth-title">Reset password</h2>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="auth-label" htmlFor="authEmail">Email</label>
              <input
                id="authEmail"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Green info box: where to find the printed link. */}
              {info && <p className="auth-info">{info}</p>}
              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn-primary auth-submit">
                Send reset link
              </button>
            </form>
            <button
              type="button"
              className="auth-link"
              onClick={() => { setTab("signin"); setError(""); setInfo("") }}
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            {/* Two tabs: sign in or create account. */}
            <div className="auth-tabs">
              <button
                type="button"
                className={tab === "signin" ? "auth-tab active" : "auth-tab"}
                onClick={() => { setTab("signin"); setError(""); setInfo("") }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={tab === "signup" ? "auth-tab active" : "auth-tab"}
                onClick={() => { setTab("signup"); setError(""); setInfo("") }}
              >
                Create account
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* The name field only exists when creating an account. */}
              {tab === "signup" && (
                <>
                  <label className="auth-label" htmlFor="authName">Name</label>
                  <input
                    id="authName"
                    type="text"
                    className="auth-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </>
              )}

              <label className="auth-label" htmlFor="authEmail">Email</label>
              <input
                id="authEmail"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="auth-label" htmlFor="authPassword">Password</label>
              <input
                id="authPassword"
                type="password"
                className="auth-input"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Link to the reset form (sign-in view only). */}
              {tab === "signin" && (
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => { setTab("forgot"); setError(""); setInfo("") }}
                >
                  Forgot password?
                </button>
              )}

              {/* Red error message from the server (if any). */}
              {error && <p className="auth-error">{error}</p>}

              {/* Pill-shaped green button, matching the rest of the site. */}
              <button type="submit" className="btn btn-primary auth-submit">
                {tab === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthModal