
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <a href="#home" className="footer-logo-link" aria-label="GLO Handyman Services home">
            <img
              src="/glo-primary-logo.png"
              alt="GLO Handyman Services"
              className="footer-logo-image"
            />
          </a>

          <h3 className="footer-tagline">
            Good work.
            <span>Thoughtfully done.</span>
          </h3>

          <p className="footer-description">
            Reliable handyman services for homes, apartments and offices
            throughout Mississauga and the GTA.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explore GLO</h3>

          <a href="#home">Home <span>↗</span></a>
          <a href="#services">Services <span>↗</span></a>
          <a href="#about">About <span>↗</span></a>
          <a href="#gallery">Gallery <span>↗</span></a>
          <a href="#contact">Contact <span>↗</span></a>
        </div>

        <div className="footer-contact">
          <h3>Let's Talk About Your Task</h3>

          <p className="footer-contact-intro">
            Tell us what you need. We'll take it from here.
          </p>

          <a
            className="footer-contact-link"
            href="mailto:glohandypro@gmail.com"
          >
            <span className="footer-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>

            <span className="footer-contact-copy">
              <strong>Email us</strong>
              <span>glohandypro@gmail.com</span>
            </span>

            <span className="footer-contact-arrow" aria-hidden="true">
              ↗
            </span>
          </a>

          <a
            className="footer-contact-link"
            href="https://www.instagram.com/glohandypro/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="footer-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle className="instagram-dot" cx="17.5" cy="6.8" r="1" />
              </svg>
            </span>

            <span className="footer-contact-copy">
              <strong>Follow us on Instagram</strong>
            </span>

            <span className="footer-contact-arrow" aria-hidden="true">
              ↗
            </span>
          </a>

          <p className="footer-location">
            <span aria-hidden="true">⌖</span>
            Proudly serving Mississauga &amp; the GTA
          </p>
        </div>
      </div>

      <div className="footer-signature" aria-hidden="true">
        <span></span>
        <svg viewBox="0 0 48 28" fill="none">
          <path d="M3 25 24 4 45 25" />
          <path d="M17 25v-8h14v8M22 17v5m5-5v5" />
        </svg>
        <span></span>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} GLO Handyman Services. All rights reserved.</p>
        <p>Small jobs. Big difference.</p>
        <p>Mississauga, Ontario</p>
      </div>
    </footer>
  );
}

export default Footer;
