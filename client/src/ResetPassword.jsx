// ------------------------------------------------------------
// client/src/ResetPassword.jsx
// The "Set new password" page. It is opened from the reset link that
// the server prints in its terminal (see sendResetPassword in
// server/auth.js). The link arrives as /reset-password?token=...
// ------------------------------------------------------------

import { useState } from "react"
import "./index.css"

// Where the Express server lives (same value as in AuthModal).
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"

function ResetPassword() {
  // The token and any error come from the link's query string.
  const params = new URLSearchParams(window.location.search)
  const token = params.get("token")
  const linkError = params.get("error") // "INVALID_TOKEN" from the server

  // The new password the user types.
  const [password, setPassword] = useState("")
  // Message to show: { type: "success" | "error", text } or null.
  const [message, setMessage] = useState(null)
  // True once the password has been changed successfully.
  const [done, setDone] = useState(false)

  // Send the new password + token to the server, which checks the
  // token against the "verification" table in Neon and then replaces
  // the password hash in the "account" table.
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword: password, token }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        let text = data.message || "Could not reset the password. Please try again."
        if (data.code === "INVALID_TOKEN")
          text = "This reset link is invalid or expired. Please request a new one."
        if (data.code === "PASSWORD_TOO_SHORT")
          text = "Password must be at least 8 characters."
        setMessage({ type: "error", text })
        return
      }

      // Success: remove the token from the address bar so refreshing
      // the page cannot show the form again with a used token.
      window.history.replaceState({}, "", "/")
      setDone(true)
    } catch {
      // The fetch itself failed - most often the server is not running.
      setMessage({ type: "error", text: "Could not reach the server. Is it running?" })
    }
  }

  // The link was clicked but the token is missing or was rejected.
  const linkProblem =
    linkError === "INVALID_TOKEN"
      ? "This reset link is invalid or expired. Please request a new one."
      : !token
        ? "This link is incomplete - it has no reset token."
        : null

  return (
    <section className="auth-page">
      <div className="auth-modal">
        <h2 className="auth-title">Set new password</h2>

        {done ? (
          <>
            <p className="auth-info">
              Your password has been changed. You can now sign in with it.
            </p>
            <a href="/" className="btn btn-primary auth-submit">
              Go to sign in
            </a>
          </>
        ) : linkProblem ? (
          <>
            <p className="auth-error">{linkProblem}</p>
            <a href="/" className="btn btn-primary auth-submit">
              Back to home
            </a>
          </>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-label" htmlFor="resetPassword">New password</label>
            <input
              id="resetPassword"
              type="password"
              className="auth-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {message && (
              <p className={message.type === "error" ? "auth-error" : "auth-info"}>
                {message.text}
              </p>
            )}

            <button type="submit" className="btn btn-primary auth-submit">
              Set new password
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default ResetPassword