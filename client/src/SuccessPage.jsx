// ------------------------------------------------------------
// client/src/SuccessPage.jsx
// After Stripe confirms the payment, it redirects here with the session
// id and the order id. We show a clean confirmation message, the order
// summary (item, price, order number) and a button back to the shop.
// ------------------------------------------------------------

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Where the Express server lives. Read from the environment at build
// time (VITE_API_URL), never hardcoded to localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // The order id is passed through from the checkout button, which got
  // it from the server when it created the 'pending' order.
  const orderId = location.state && location.state.orderId;

  // The server returns the saved order so we can show the price and the
  // item name directly from our database (never from Stripe's redirect).
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      // If the parent passed the order id via state, we can show it
      // immediately without a second request.
      if (orderId) {
        setOrder({ id: orderId, item_id: null, status: 'pending' });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          credentials: 'include',
        });
        const body = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) {
          setOrder(body);
        }
      } catch {
        // Server unreachable - show what we have.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // A user who pays while signed in should stay signed in; a user who
  // pays while signed out should be redirected to the sign-in page so
  // their order is attached to an account on the next visit.
  const isSignedIn = !!window.currentUser;

  useEffect(() => {
    if (isSignedIn) {
      return;
    }
    const timer = setTimeout(() => {
      // The sign-in page will read this query param and send the user
      // back here with the order id after a successful login.
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}?order_id=${orderId}`
      );
      window.location.href = '/#signin';
    }, 1500);
    return () => clearTimeout(timer);
  }, [orderId, isSignedIn]);

  if (loading && !order) {
    return (
      <div className="checkout-success">
        <div className="checkout-success-box">
          <span className="checkout-spinner" aria-label="Loading" />
          <p className="checkout-loading-text">Loading your order...</p>
        </div>
      </div>
    );
  }

  // If we could not load the order (server unreachable), show the
  // order id we have and a link to the menu. No raw error dumps.
  const orderSummary =
    order && order.item_id !== null
      ? {
          name: order.item_name || 'Item',
          price: order.item_price || '$0.00',
          id: order.id,
          status: order.status,
        }
      : null;

  return (
    <div className="checkout-success">
      <div className="checkout-success-box">
        <span className="checkout-icon">🎉</span>
        <h2 className="checkout-title">Thank you!</h2>

        {!orderSummary ? (
          <p className="checkout-note">
            We couldn't load your order details right now, but your
            payment went through. Come back to the menu later to see your
            order.
          </p>
        ) : (
          <>
            <p className="checkout-subtitle">
              Your order is confirmed
              {orderSummary.id ? ` #${orderSummary.id}` : ''}
            </p>
            <div className="checkout-summary">
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">Item</span>
                <span className="checkout-summary-value">{orderSummary.name}</span>
              </div>
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">Price</span>
                <span className="checkout-summary-value">{orderSummary.price}</span>
              </div>
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">Status</span>
                <span className="checkout-summary-value">Paid</span>
              </div>
            </div>
          </>
        )}

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
