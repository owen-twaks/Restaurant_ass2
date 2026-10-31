// ------------------------------------------------------------
// client/src/Checkout.jsx
// One page with two jobs:
//
// 1. The "Buy now" / "Checkout" button on each product. It sends the
//    item id to the server, and Stripe redirects the customer to the
//    payment page. While the request is running the button shows a
//    spinner and cannot be clicked. If the request fails we show a
//    friendly message instead of a raw error dump.
//
// 2. When the customer finishes (or cancels) Stripe redirects them to
//    /success (paid) or /cancel (not paid). Both show a clean message
//    and a button back to the shop.
// ------------------------------------------------------------

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Where the Express server lives. We read it from the environment at
// build time (VITE_API_URL), never hardcoded to localhost, so the same
// build works on Vercel and on localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// The pages Stripe redirects to after the customer pays (or cancels).
const SUCCESS_PATH = '/success';
const CANCEL_PATH = '/cancel';

/**
 * The checkout button. Props:
 *   item.id    - the menu item to buy
 *   item.name  - shown in the checkout summary
 *   item.price - shown in the checkout summary (e.g. "$7.50")
 *   isPaid     - set by the parent when the customer has already paid
 *   orderId    - the order we created at checkout (so the success page
 *                can show the order number)
 *
 * When the button is clicked we POST the item id to the server, which
 * writes a 'pending' order and returns the Stripe session URL. The
 * button shows a spinner while the request is in flight, and cannot be
 * clicked until the request finishes.
 */
export default function CheckoutButton({
  item,
  isPaid,
  orderId,
}) {
  const navigate = useNavigate();

  // Whether the request is in flight (spinner + disabled state).
  const [loading, setLoading] = useState(false);
  // A friendly message shown when the request fails.
  const [error, setError] = useState(null);

  // When the customer arrives back from Stripe at /success we read the
  // session id and order id from the query string and forward the user.
  const params = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      sessionId: p.get('session_id'),
      itemId: p.get('item_id'),
      orderId: p.get('order_id') || p.get('orderId'),
    };
  }, []);

  useEffect(() => {
    // /success was opened with query params - store the order so the
    // parent can show it on the success page, then advance.
    if (params.orderId) {
      window.history.replaceState(
        {},
        '',
        window.location.pathname
      );
      window.dispatchEvent(
        new CustomEvent('checkout:done', { detail: { orderId: params.orderId } })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.orderId]);

  // If we came back from a successful payment, just advance.
  if (params.sessionId && params.orderId) {
    // Small delay so Stripe's redirect is finished.
    setTimeout(() => {
      navigate('/success', { state: { orderId: params.orderId } });
    }, 300);
    return null;
  }

  // Cancel page: if the session id is missing but we were redirected to
  // /cancel, show a no-charge message and go back to the shop.
  // The parent renders this button; we only forward if a session id
  // arrived with the redirect.
  if (window.location.pathname === '/cancel') {
    return (
      <div className="checkout-cancel">
        <div className="checkout-cancel-box">
          <span className="checkout-cancel-icon">🛑</span>
          <h2 className="checkout-cancel-title">Payment cancelled</h2>
          <p className="checkout-cancel-text">
            Your payment was not completed, so no charge was made. You can
            pick another dish and try again.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/#menu')}
          >
            Back to the menu
          </button>
        </div>
      </div>
    );
  }

  // If the item was already paid, show nothing (the success page handles
  // the rest).
  if (isPaid) {
    return null;
  }

  // The actual button. Loading state is applied while we wait for the
  // server. Errors are shown as a friendly message, never a raw dump.
  return (
    <>
      {(loading || error) && (
        <div className="checkout-message" role="alert">
          {loading && <span className="spinner" aria-label="Loading" />}
          {error && <span className="checkout-message-text">{error}</span>}
        </div>
      )}

      <button
        type="button"
        className="checkout-btn"
        disabled={loading}
        aria-busy={loading}
        aria-label={`Checkout ${item.name} - loading, please wait`}
        onClick={async () => {
          setError(null);
          setLoading(true);

          try {
            // Send only the item id - the server loads the price from
            // the database itself, so the client can never change the
            // amount. credentials: "include" sends the session cookie,
            // which the server uses to link the order to the user.
            const res = await fetch(`${API_URL}/api/checkout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ itemId: item.id }),
            });

            const body = await res.json().catch(() => ({}));

            if (!res.ok) {
              const message =
                body.error ||
                'Could not start checkout. Please try again.';
              setError(message);
              return;
            }

            // Redirect to Stripe. The browser opens the checkout page in
            // a popup so the rest of the page stays responsive.
            window.open(body.url, '_blank', 'noopener,noreferrer');
          } catch (err) {
            // A network failure (server unreachable, etc.) - not a Stripe
            // error. Show a friendly message.
            setError('Could not reach the server. Is it running?');
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? (
          <>
            <span className="spinner" aria-label="Checking out" />
            <span>Checking out...</span>
          </>
        ) : (
          <>Buy now · {item.name}</>
        )}
      </button>
    </>
  );
}

export { SUCCESS_PATH, CANCEL_PATH };
