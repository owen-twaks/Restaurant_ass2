import "./index.css";
import Header from "./Header.jsx";
import Hero from "./Hero.jsx";
import MainContent from "./MainContent.jsx";
import Footer from "./Footer.jsx";
import { CartProvider } from "./CartContext.jsx";
import Cart from "./Cart.jsx";
import ReservationForm from "./ReservationForm.jsx";
import ResetPassword from "./ResetPassword.jsx";
import CheckoutButton from "./Checkout.jsx";
import SuccessPage from "./SuccessPage.jsx";
import CancelPage from "./CancelPage.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  // The password-reset link opens /reset-password?token=... - show
  // the "set new password" form instead of the restaurant site.
  const isResetPage = window.location.pathname.startsWith("/reset-password");

  return (
    <CartProvider>
      <BrowserRouter>
        <Header />
        {isResetPage ? (
          <ResetPassword />
        ) : (
          <>
            <Hero />
            <MainContent />
            <ReservationForm />
            <Cart />
            <Routes>
              <Route path="/checkout/:itemId" element={<CheckoutButton item={{}} />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/cancel" element={<CancelPage />} />
            </Routes>
          </>
        )}
        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
