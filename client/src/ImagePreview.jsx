import "./index.css"
import { useState } from "react"

function ImagePreview({ item, onClose }) {
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    window.location.hash = "#cart"
    onClose()
  }

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview" onClick={(e) => e.stopPropagation()}>
        <div className="image-preview-header">
          <button
            type="button"
            className="image-preview-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="image-preview-body">
          <img
            src={item.image}
            alt={item.name}
            className="image-preview-img"
          />
        </div>

        <div className="image-preview-footer">
          <div className="image-preview-info">
            <h3 className="image-preview-name">{item.name}</h3>
            <p className="image-preview-desc">{item.description}</p>
            <p className="image-preview-price">{item.price}</p>

            <div className="image-preview-quantity">
              <button
                type="button"
                className="quantity-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="image-preview-quantity-value">{quantity}</span>
              <button
                type="button"
                className="quantity-btn"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="cart-btn image-preview-cart-btn"
              onClick={handleAddToCart}
            >
              Add to cart ({quantity})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImagePreview
