
function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="hero-label">MISSISSAUGA & GTA</p>

        <h1>
          Small jobs to big tasks...
          <br />
          <span>I've got you covered!</span>
        </h1>

        <p className="hero-description">
          Reliable, affordable and professional handyman services
          for your home, apartment or office.
        </p>

        <div className="hero-buttons">
          <a href="#contact" className="hero-quote-button">
            Get a Quote
          </a>

          <a href="#services" className="hero-services-button">
            View Services
          </a>
        </div>

        <div className="hero-features">
          <div>
            <strong>✓</strong>
            Reliable Service
          </div>

          <div>
            <strong>✓</strong>
            Professional Work
          </div>

          <div>
            <strong>✓</strong>
            Flexible Scheduling
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
