import { useEffect, useRef, useState } from 'react';
import DateTimePicker from './DateTimePicker';



function validateContactForm(formData) {
  const email = (formData.email || '').trim().toLowerCase();
  const phone = (formData.phone || '').trim();

  const approvedDomains = new Set([
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'yahoo.com',
    'yahoo.ca',
    'icloud.com',
    'me.com',
    'mac.com'
  ]);

  const commonDomainTypos = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'g-mail.com': 'gmail.com',
    'gma.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outllook.com': 'outlook.com'
  };

  const emailPattern =
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

  const phonePattern =
    /^(?:\+?1[ .-]?)?(?:\([2-9]\d{2}\)|[2-9]\d{2})[ .-]?[2-9]\d{2}[ .-]?\d{4}$/;

  if (!email && !phone) {
    return 'Please enter an email address or phone number.';
  }

  let emailError = '';

  if (email) {
    if (!emailPattern.test(email)) {
      emailError = 'Please provide a valid email address.';
    } else {
      const domain = email.split('@')[1];

      if (commonDomainTypos[domain]) {
        emailError = `Did you mean ${commonDomainTypos[domain]}? Please check your email address.`;
      } else if (!approvedDomains.has(domain)) {
        emailError =
          'Please use a supported personal email address: Gmail, Outlook, Yahoo, or iCloud.';
      }
    }
  }

  let phoneError = '';

  if (phone && !phonePattern.test(phone)) {
    phoneError = 'Please enter a valid phone number.';
  }

  if (emailError && phoneError) {
    return 'Please provide a valid email address and phone number.';
  }

  if (emailError) {
    return emailError;
  }

  if (phoneError) {
    return phoneError;
  }

  return '';
}

function Contact() {
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
  const messageRef = useRef(null);

  useEffect(() => {
    if (submitted || errorMessage) {
      messageRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [submitted, errorMessage]);

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

  if (submitting) return;

  const validationError = validateContactForm(formData);

  if (validationError) {
    setErrorMessage(validationError);
    return;
  }

  if (!formData.preferredDate || !formData.preferredTime) {
    setErrorMessage("Please choose your preferred visit date and time.");
    return;
  }

  const currentDate = new Date();
  const currentDateKey = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0"),
  ].join("-");

  if (formData.preferredDate < currentDateKey) {
    setErrorMessage("Please select today or a future date.");
    return;
  }

  const [visitHour, visitMinute] = formData.preferredTime.split(":").map(Number);
  const visitMinutes = visitHour * 60 + visitMinute;
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  if (
    formData.preferredDate === currentDateKey &&
    visitMinutes < currentMinutes
  ) {
    setErrorMessage(
      "Your preferred time has already passed. Please choose the current minute or a later time."
    );
    return;
  }

  setSubmitting(true);
  setSubmitted(false);
  setErrorMessage("");

  const controller = new AbortController();

  // Give the backend up to 75 seconds to wake up and respond.
  const timeoutId = setTimeout(() => controller.abort(), 75000);

  // Explain the delay if the backend is slow.
  const slowRequestId = setTimeout(() => {
    setErrorMessage(
      "We're connecting to our server. This may take a little longer than usual. Please wait..."
    );
  }, 8000);

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!apiBaseUrl) {
      throw new Error("The quote service is temporarily unavailable. Please try again later.");
    }

    const response = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}/api/quotes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
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
          "We couldn't confirm the submission. Please contact us before trying again."
        );
      }
    }

    if (!response.ok) {
      if (responseData.errors) {
        throw new Error(Object.values(responseData.errors).join(". "));
      }

      throw new Error(
        responseData.message ||
          `Failed to submit your quote request (HTTP ${response.status}).`
      );
    }

    setSubmitted(true);
    setErrorMessage("");

    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
    });
  } catch (error) {
    console.error("Quote submission failed:", error);

    if (error.name === "AbortError") {
      setErrorMessage(
        "We couldn't confirm whether your request was received because the server took too long to respond. Please contact us before submitting again to avoid a duplicate request."
      );
    } else if (error instanceof TypeError) {
      setErrorMessage(
        "We couldn't connect to the quote service. Your request may not have been received. If you are unsure, please contact us before trying again."
      );
    } else {
      setErrorMessage(
        error.message || "Something went wrong. Please contact us if the problem continues."
      );
    }
  } finally {
    clearTimeout(timeoutId);
    clearTimeout(slowRequestId);
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
        <div ref={messageRef} className="success-message" role="status">
          ✓ Thank you! Your quote request has been received.
          We will contact you to confirm availability.
        </div>
      )}

      {errorMessage && (
        <div ref={messageRef} className="error-message" role="alert">
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
              autoComplete="email"
              id="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              autoComplete="tel"
              id="phone"
              name="phone"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
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
            <label>Preferred visit date and time</label>

            <DateTimePicker
              date={formData.preferredDate}
              time={formData.preferredTime}
              onDateChange={(value) => {
                setFormData((previousData) => ({
                  ...previousData,
                  preferredDate: value
                  }));
                setSubmitted(false);
                setErrorMessage('');
              }}
              onTimeChange={(value) => {
                setFormData((previousData) => ({
                  ...previousData,
                  preferredTime: value
                  }));
                setSubmitted(false);
                setErrorMessage('');
              }}
            />
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
