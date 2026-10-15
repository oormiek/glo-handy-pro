function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-brand">
          <div className="footer-logo">
            <span>GLO</span> HANDYMAN SERVICES
          </div>

          <p>
            Reliable handyman services for homes,
            apartments and offices throughout Mississauga
            and the GTA.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>

          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-contact">
          <h3>Get In Touch</h3>

          <p>📍 Mississauga & GTA</p>
          <p>📞 Contact us for a quote</p>
          <p>✉️ Send us your project details</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © 2026 GLO Handyman Services. All rights reserved.
        </p>

        <p>
          Mississauga, Ontario
        </p>
      </div>
    </footer>
  );
}

export default Footer;