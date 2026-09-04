import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-logo">Find<span>Cert</span></span>
          <p>Discover live music, festivals, and shows — without the hassle.</p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Discover</h4>
            <Link to="/">Search events</Link>
            <Link to="/favorites">Favorites</Link>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Pricing</a>
          </div>
          <div className="footer-column">
            <h4>Get the app</h4>
            <a href="#">iOS</a>
            <a href="#">Android</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Riffs</span>
        <div className="footer-socials">
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="X">X</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;