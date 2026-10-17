
import { useState } from 'react';

function Contact() {
  const today = new Date();
  const minimumDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    setSubmitted(false);
    setErrorMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formData.preferredDate && formData.preferredDate < minimumDate) {
      setErrorMessage('Please select today or a future date.');
      return;
    }

    setSubmitting(true);
    setSubmitted(false);
    setErrorMessage('');

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      if (!apiBaseUrl) {
        throw new Error(
          'API URL is not configured. Please check your .env file.'
        );
      }

      const response = await fetch(
        `${apiBaseUrl.replace(/\/+$/, '')}/api/quotes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const responseText = await response.text();
      let responseData = {};

      if (responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          if (!response.ok) {
            throw new Error(
              `The server returned an unexpected response (HTTP ${response.status}).`
            );
          }

          throw new Error(
            'The server response could not be read. Please try again.'
          );
        }
      }

      if (!response.ok) {
        if (responseData.errors) {
          throw new Error(Object.values(responseData.errors).join('. '));
        }

        throw new Error(
          responseData.message ||
          `Failed to submit quote request (HTTP ${response.status}).`
        );
      }

      setSubmitted(true);

      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        preferredDate: '',
        preferredTime: '',
        message: ''
      });
    } catch (error) {
      console.error('Quote submission failed:', error);

      if (error instanceof TypeError) {
        setErrorMessage(
          'Unable to connect to the server. Please check that the backend is running and try again.'
        );
      } else {
        setErrorMessage(
          error.message || 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-header">
        <p className="section-label">GET A QUOTE</p>
        <h2>Tell us about your task.</h2>
        <p>
          Send us a few details about the work you need.
          Let us know your preferred visit date and time, too.
        </p>
      </div>

      {submitted && (
        <div className="success-message" role="status">
          ✓ Thank you! Your quote request has been received.
          We will contact you to confirm availability.
        </div>
      )}

      {errorMessage && (
        <div className="error-message" role="alert">
          {errorMessage}
        </div>
      )}

      <form className="quote-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="service">Service</label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="">Select a service</option>
              <option value="furniture">Furniture Assembly</option>
              <option value="tv-mounting">TV & Wall Mounting</option>
              <option value="faucet">Faucet Installation</option>
              <option value="repairs">Minor Repairs</option>
              <option value="hanging">Hanging & Installing</option>
              <option value="drywall">Drywall Patching</option>
              <option value="carpentry">Light Carpentry</option>
              <option value="doors">Door & Cabinet Adjustments</option>
              <option value="moving">Loading & Unloading</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>

        <h3 className="appointment-heading">Preferred Visit Date & Time</h3>
        <p className="appointment-note">
          When would you like us to visit? This is a request, not a confirmed
          booking. We will contact you to confirm availability.
        </p>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="preferredDate">Preferred date (optional)</label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              min={minimumDate}
              value={formData.preferredDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="preferredTime">Preferred time (optional)</label>
            <select
              id="preferredTime"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
            >
              <option value="">Any time / flexible</option>
              <option value="08:00">8:00 AM</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
              <option value="18:00">6:00 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="20:00">8:00 PM</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">Tell us about your task</label>
          <textarea
            id="message"
            name="message"
            rows="6"
            placeholder="What do you need help with?"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="quote-submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Request a Quote'}
        </button>
      </form>
    </section>
  );
}

export default Contact;
