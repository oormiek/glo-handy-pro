
import './App.css';
import Navbar from './components/Navbar';
import Services from './components/Services';
import Hero from './components/Hero';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from "./components/Admin";

function App() {
  if (window.location.pathname === "/admin") {
    return <Admin />;
  }

  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
