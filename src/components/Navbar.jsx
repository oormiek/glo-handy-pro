
function Navbar() {
  return (
    <nav className="navbar">
      <a href="#home" className="logo" aria-label="GLO Handyman Services home">
        <img
          src="/glo-primary-logo.png"
          alt="GLO Handyman Services"
          className="logo-image"
        />
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#gallery">Gallery</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">Contact</a>
      </div>

      <a href="#contact" className="nav-button">
        Get a Quote
      </a>
    </nav>
  );
}

export default Navbar;
