import "./index.css"

function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">Bella Tavola In Town</h1>
        <p className="hero-subtitle">Authentic Italian Cuisine</p>
        <a href="#reservation" className="btn btn-primary">Reserve a Table</a>
      </div>
    </section>
  )
}

export default Hero
