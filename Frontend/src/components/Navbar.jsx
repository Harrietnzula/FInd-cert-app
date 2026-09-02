import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <svg
          className="navbar-logo-icon"
          width="26"
          height="26"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M6 20C6 20 12 14 20 14C28 14 34 20 34 20"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
          />
          <path
            d="M6 20C6 20 12 26 20 26C28 26 34 20 34 20"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
          />
          <ellipse cx="20" cy="20" rx="6" ry="14" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <ellipse cx="20" cy="20" rx="14" ry="6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <circle cx="15" cy="14" r="1.3" fill="currentColor" />
          <circle cx="24" cy="12" r="1" fill="currentColor" />
        </svg>
        Find<span>Cert</span>
      </Link>
      <div className="navbar-links">
        <Link to="/">Search</Link>
        <Link to="/favorites">Favorites</Link>
        {isAuthenticated ? (
          <>
            <NotificationBell />
            <Link to="/profile" className="navbar-profile-icon" aria-label="Profile" title={user.username}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" />
              ) : (
                <span>{(user.username || "?").slice(0, 2).toUpperCase()}</span>
              )}
            </Link>
            <button onClick={handleLogout} className="navbar-logout">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;