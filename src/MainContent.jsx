import "./index.css"
import { useState } from "react"
import { menuItems } from "./data/menu.js"
import FoodCard from "./FoodCard.jsx"
import { useCart } from "./CartContext.jsx"
import ImagePreview from "./ImagePreview.jsx"

function MainContent() {
  const { cart, addItem, increase, decrease, remove, clear, getTotal } = useCart()
  const [previewItem, setPreviewItem] = useState(null)

  const handleImageClick = (item) => {
    setPreviewItem(item)
  }

  const handlePreviewClose = () => {
    setPreviewItem(null)
  }
  const [category, setCategory] = useState("All")
  const categories = ["Starters", "Main Courses", "Desserts"]

  const filteredItems =
    category === "All" ? menuItems : menuItems.filter((item) => item.category === category)

  return (
    <main className="page-body">
      {previewItem && (
        <ImagePreview item={previewItem} onClose={handlePreviewClose} />
      )}
      <section id="menu" className="menu-section container">
        <h2 className="section-title">Our Menu</h2>

        <div className="menu-filters">
          <button
            type="button"
            className={`menu-filter ${category === "All" ? "active" : ""}`}
            onClick={() => setCategory("All")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`menu-filter ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="menu-category">
              <h3 className="category-title">{item.category}</h3>
              <div className="menu-list">
                <FoodCard
                  item={item}
                  cart={cart}
                  addItem={addItem}
                  onImageClick={handleImageClick}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="about-section container">
        <div className="about-card">
          <div className="about-image-wrapper">
            <img
              src="https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Bella Tavola Restaurant Interior"
              className="about-img"
            />
          </div>
          <div className="about-text-content">
            <h2 className="about-heading">About Us</h2>
            <p className="about-description">
              Bella Tavola is a family-owned restaurant serving traditional Italian food made with fresh, local ingredients. Our goal is to bring authentic Italian flavors to every table.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default MainContent
