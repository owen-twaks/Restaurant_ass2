import { useEffect, useState } from "react"
import "./index.css"
import { useCart } from "./CartContext.jsx"
import AuthModal from "./AuthModal.jsx"

// Where the Express server lives (same value as in AuthModal).
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"

function Header() {
  const { cart, total } = useCart()
  // Hamburger menu open/closed (mobile).
  const [menuOpen, setMenuOpen] = useState(false)
  // Whether the sign-in pop-up is on screen.
  const [showAuth, setShowAuth] = useState(false)
  // The signed-in user (null = nobody signed in).
  const [user, setUser] = useState(null)

  // Ask the server "who am I?" using the session cookie.
  // Called when the page loads (so a refresh keeps you signed in)
  // and after sign-up/sign-in succeed.
  const loadSession = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/get-session`, {
        credentials: "include",
      })
      const data = await res.json()
      setUser(data && data.user ? data.user : null)
    } catch {
      // Server unreachable - treat as signed out.
      setUser(null)
    }
  }

  // Run once when the page loads: the browser automatically sends the
  // session cookie, so the server tells us who is signed in.
  // (loadSession only uses stable setters and a constant, so it is
  // safe to run this effect just once on mount.)
  useEffect(() => {
    loadSession()
  }, [])

  // Sign out: end the session on the server (which also removes the
  // cookie), then show the signed-out header.
  const handleSignOut = async () => {
    setMenuOpen(false)
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setUser(null)
      }
      // If the server says no, stay signed in - the session is still real.
    } catch {
      // Server unreachable - the session stays until it can be ended.
    }
  }

  // Navigating anywhere in the header closes the mobile menu.
  const goHome = () => {
    setMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="nav-container">
        <a href="#home" className="logo" onClick={goHome}>Bella Tavola in Town</a>

        <button
          type="button"
          className={menuOpen ? "menu-toggle open" : "menu-toggle"}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={menuOpen ? "nav-menu open" : "nav-menu"}>
          <a href="#home" className="nav-link active" onClick={goHome}>Home</a>
          <a href="#menu" className="nav-link" onClick={goHome}>Menu</a>
          <a href="#about" className="nav-link" onClick={goHome}>About</a>
          <a href="#reservation" className="nav-link" onClick={goHome}>Reservation</a>
          {/* Signed in: the user's name + Sign out. Signed out: Sign in. */}
          {user ? (
            <>
              <span className="account-name">Hi, {user.name}</span>
              <button type="button" className="account-btn" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button type="button" className="account-btn" onClick={() => setShowAuth(true)}>
              Sign In
            </button>
          )}
        </nav>

        <a href="#cart" className="cart-link" onClick={goHome}>
          <span className="cart-icon">🛒</span>
          <span className="cart-count">{cart.length}</span>
        </a>
      </div>

      {/* The sign-in / create-account pop-up. */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={loadSession}
      />
    </header>
  )
}

export default Header