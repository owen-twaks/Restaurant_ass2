import "./index.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <h3 className="footer-brand">Bella Tavola In Town</h3>
          <p className="footer-tagline">Good food. Good company.</p>
        </div>
        <div className="footer-col hours-col">
          <h4 className="footer-heading">Opening Hours</h4>
          <div className="hours-grid">
            <span className="day">Monday - Friday:</span>
            <span className="time">11:00 - 22:00</span>
            <span className="day">Saturday:</span>
            <span className="time">12:00 - 23:00</span>
            <span className="day">Sunday:</span>
            <span className="time">Closed</span>
          </div>
        </div>
        <div className="footer-col location-col">
          <h4 className="footer-heading">Location</h4>
          <address className="footer-address">
            Main Street 25<br />
            Banja Luka<br />
            Bosnia and Herzegovina
          </address>
        </div>
      </div>
    </footer>
  )
}

export default Footer
