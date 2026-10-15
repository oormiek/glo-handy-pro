
function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-glo">GLO</span>
        <span className="logo-text">HANDYMAN SERVICES</span>
      </div>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#gallery">Gallery</a>
        <a href="#contact">Contact</a>
      </div>

      <a href="#contact" className="nav-button">
        Get a Quote
      </a>
    </nav>
  );
}

export default Navbar;
