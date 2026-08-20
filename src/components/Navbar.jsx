import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
         Find<span>Cert</span>
      </Link>
      <div className="navbar-links">
        <Link to="/">Search</Link>
        <Link to="/favorites">Favorites</Link>
      </div>
    </nav>
  );
}

export default Navbar;