import "./index.css"
import { useCart } from "./CartContext.jsx"
import CheckoutButton from "./Checkout.jsx"

function FoodCard({
  item,
  cart,
  onImageClick,
  isPaid,
  orderId,
}) {
  const { addItem, increase, decrease, remove } = useCart()

  // The button posts the item id to the server (which reads the price)
  // and redirects to Stripe. Loading state is passed from the parent;
  // the parent owns the state so the button can show a spinner and
  // cannot be clicked while the request is in flight.
  return (
    <div className="menu-item">
      <img
        src={item.image}
        alt={item.name}
        className="menu-item-img"
        onClick={() => onImageClick(item)}
        style={{ cursor: 'zoom-in' }}
      />
      <div className="menu-item-details">
        <div className="menu-item-header">
          <span className="menu-item-name">{item.name}</span>
          <span className="menu-item-price">{item.price}</span>
        </div>
        <p className="menu-item-desc">{item.description}</p>
        <div className="menu-item-actions">
          <button
            type="button"
            className="cart-btn"
            onClick={() => addItem(item)}
          >
            Add to cart
          </button>
          <CheckoutButton
            item={item}
            isPaid={isPaid || false}
            orderId={orderId || null}
          />
        </div>
      </div>
    </div>
  )
}

export default FoodCard
