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
          <path d="M17 10v19.5a5.5 5.5 0 1 1-2-4.2V10h2Z" fill="currentColor" />
          <path d="M17 10h13v4H17zM30 12v15.5a5.5 5.5 0 1 1-2-4.2V12h2Z" fill="currentColor" />
        </svg>
        Riffs
      </Link>
      <div className="navbar-links">
        <Link to="/">Search</Link>
        <Link to="/explore">Explore</Link>
        {isAuthenticated && <Link to="/messages">Messages</Link>}
        <Link to="/discover">Discover</Link>
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