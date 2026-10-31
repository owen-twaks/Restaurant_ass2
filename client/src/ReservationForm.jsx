import "./index.css"
import { useState } from "react"

function ReservationForm() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    date: "",
    time: "18:00",
    guests: "4",
    requests: ""
  })
  const [errors, setErrors] = useState({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedName, setSubmittedName] = useState("")

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(formData.date)
      selectedDate.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past"
      }

      const day = selectedDate.getDay()
      if (day === 0) {
        newErrors.date = "We are closed on Sundays"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const submittedNameValue = formData.name.trim()
      setSubmittedName(submittedNameValue)
      setShowConfirmation(true)
      setFormData({
        name: "",
        contact: "",
        email: "",
        date: "",
        time: "18:00",
        guests: "4",
        requests: ""
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <section id="reservation" className="reservation-section container">
      <h2 className="section-title">Make a Reservation</h2>

      {showConfirmation ? (
      <div className="reservation-status success">
        <p>Thank you, {submittedName}! Your details have been captured.</p>
          <p>
            We have noted your reservation. This was a demo form — your details
            were not sent to the restaurant. They were captured only in this
            browser session.
          </p>
        </div>
      ) : (
        <form
        className="reservation-form"
        id="reservationForm"
        onSubmit={handleSubmit}
      >
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="name"
                id="resName"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "form-control error" : "form-control"}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                id="resEmail"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "form-control error" : "form-control"}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="date"
                name="date"
                id="resDate"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? "form-control error" : "form-control"}
              />
              {errors.date && <span className="error-msg">{errors.date}</span>}
            </div>

            <div className="form-group">
              <select
                name="guests"
                id="resGuests"
                value={formData.guests}
                onChange={handleChange}
                className="form-control"
              >
                <option value="" disabled selected hidden>Guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6+">6+ Guests</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="contact"
                id="resContact"
                placeholder="Contact number"
                value={formData.contact}
                onChange={handleChange}
                className={errors.contact ? "form-control error" : "form-control"}
              />
              {errors.contact && (
                <span className="error-msg">{errors.contact}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="time"
                name="time"
                id="resTime"
                value={formData.time}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="requests"
                id="resRequests"
                placeholder="Special requests"
                value={formData.requests}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit"
          >
            Reserve
          </button>
        </form>
      )}
    </section>
  )
}

export default ReservationForm
