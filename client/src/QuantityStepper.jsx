import "./index.css"

function QuantityStepper({ value, onChange }) {
  const increment = () => onChange(value + 1)
  const decrement = () => (value > 0 ? onChange(value - 1) : undefined)

  return (
    <div className="quantity-stepper">
      <button
        type="button"
        className="quantity-btn"
        onClick={decrement}
        disabled={value <= 0}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="quantity-value">{value}</span>
      <button
        type="button"
        className="quantity-btn"
        onClick={increment}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
