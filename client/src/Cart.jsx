import "./index.css"
import { useCart } from "./CartContext.jsx"

function Cart() {
  const { cart, increase, decrease, remove, clear, getTotal } = useCart()
  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <p>Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h3>Your Cart</h3>
        <button type="button" className="clear-btn" onClick={clear}>
          Clear
        </button>
      </div>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">{item.price}</span>
            </div>
            <div className="cart-item-quantity">
              <button
                type="button"
                className="quantity-btn"
                onClick={() => decrease(item)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="cart-item-quantity-value">{item.quantity}</span>
              <button
                type="button"
                className="quantity-btn"
                onClick={() => increase(item)}
                aria-label="Increase quantity"
              >
                +
              </button>
              <button
                type="button"
                className="remove-btn"
                onClick={() => remove(item)}
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
            <div className="cart-item-subtotal">
              <span>${item.price * item.quantity}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="cart-footer-row">
          <span>Subtotal</span>
          <span>${getTotal()}</span>
        </div>
        <div className="cart-footer-row">
          <span>Total</span>
          <span><strong>${getTotal()}</strong></span>
        </div>
        <button type="button" className="checkout-btn">
          Checkout
        </button>
      </div>
    </div>
  )
}

export default Cart
