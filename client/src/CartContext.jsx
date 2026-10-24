import { createContext, useContext, useState } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const increase = (item) => {
    setCart((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
    )
  }

  const decrease = (item) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  const remove = (item) => {
    setCart((prev) => prev.filter((i) => i.id !== item.id))
  }

  const clear = () => {
    setCart([])
  }

  const getSubtotal = (item) => {
    const priceValue = parseFloat(item.price.replace('$', ''))
    return priceValue * item.quantity
  }
  const getTotal = () => cart.reduce((sum, item) => sum + getSubtotal(item), 0)

  return (
    <CartContext.Provider
      value={{ cart, addItem, increase, decrease, remove, clear, getTotal, getSubtotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
