import "./index.css"
import Header from "./Header.jsx"
import Hero from "./Hero.jsx"
import MainContent from "./MainContent.jsx"
import Footer from "./Footer.jsx"
import { CartProvider } from "./CartContext.jsx"
import Cart from "./Cart.jsx"
import ReservationForm from "./ReservationForm.jsx"
import ResetPassword from "./ResetPassword.jsx"

function App() {
  // The password-reset link opens /reset-password?token=... - show
  // the "set new password" form instead of the restaurant site.
  const isResetPage = window.location.pathname.startsWith("/reset-password")

  return (
    <CartProvider>
      <Header />
      {isResetPage ? (
        <ResetPassword />
      ) : (
        <>
          <Hero />
          <MainContent />
          <ReservationForm />
          <Cart />
        </>
      )}
      <Footer />
    </CartProvider>
  )
}

export default App