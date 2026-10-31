// ------------------------------------------------------------
// client/src/CancelPage.jsx
// Stripe redirects the customer here when they close the payment page
// or choose "cancel". We show a friendly message - no charge was made -
// and a button back to the shop.
// ------------------------------------------------------------

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CancelPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Hide the address bar / query string so the page looks clean if
    // someone refreshes. The page is only for the customer.
    window.history.replaceState({}, '', '/cancel');
  }, []);

  return (
    <div className="checkout-cancel">
      <div className="checkout-cancel-box">
        <span className="checkout-cancel-icon">🛑</span>
        <h2 className="checkout-cancel-title">Payment cancelled</h2>
        <p className="checkout-cancel-text">
          Your payment was not completed, so no charge was made. You can
          pick another dish and try again, or keep browsing the menu.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/#menu')}
        >
          Back to the shop
        </button>
      </div>
    </div>
  );
}
