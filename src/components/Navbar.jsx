import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Gig Radar
      </Link>
      <div className="navbar-links">
        <Link to="/">Search</Link>
        <Link to="/favorites">Favorites</Link>
      </div>
    </nav>
  );
}

export default Navbar;