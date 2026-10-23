import "./index.css"
import { useCart } from "./CartContext.jsx"

function Header() {
  const { cart, total } = useCart()
  return (
    <header className="header">
      <div className="nav-container">
        <a href="#home" className="logo">Bella Tavola in Town</a>
        <nav className="nav-menu">
          <a href="#home" className="nav-link active">Home</a>
          <a href="#menu" className="nav-link">Menu</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#reservation" className="nav-link">Reservation</a>
        </nav>
        <a href="#cart" className="cart-link">
          <span className="cart-icon">🛒</span>
          <span className="cart-count">{cart.length}</span>
        </a>
      </div>
    </header>
  )
}

export default Header
