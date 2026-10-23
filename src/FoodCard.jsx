import "./index.css"
import { useCart } from "./CartContext.jsx"

function FoodCard({
  item,
  cart,
  onImageClick
}) {
  const { addItem, increase, decrease, remove } = useCart()
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
        <button
          type="button"
          className="cart-btn"
          onClick={() => addItem(item)}
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

export default FoodCard
