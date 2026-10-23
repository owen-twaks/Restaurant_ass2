import "./index.css"
import Header from "./Header.jsx"
import Hero from "./Hero.jsx"
import MainContent from "./MainContent.jsx"
import Footer from "./Footer.jsx"
import { CartProvider } from "./CartContext.jsx"
import Cart from "./Cart.jsx"
import ReservationForm from "./ReservationForm.jsx"

function App() {
  return (
    <CartProvider>
      <Header />
      <Hero />
      <MainContent />
      <ReservationForm />
      <Cart />
      <Footer />
    </CartProvider>
  )
}

export default App
