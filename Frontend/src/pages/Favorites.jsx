import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import { Link } from "react-router-dom";
import "./Favorites.css";

function Favorites() {
  const { favorites, loading } = useFavorites();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="favorites-page">
        <h1>Your Favorites</h1>
        <div className="empty-favorites">
          <p className="empty-favorites-icon">♡</p>
          <p className="status-message">Log in to save and view your favorite events.</p>
          <Link to="/login" className="empty-favorites-link">
            Log in →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-page">
        <h1>Your Favorites</h1>
        <p className="status-message">Loading your favorites…</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1>Your Favorites</h1>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <p className="empty-favorites-icon">♡</p>
          <p className="status-message">No favorites yet.</p>
          <Link to="/" className="empty-favorites-link">
            Search for events →
          </Link>
        </div>
      ) : (
        <div className="event-list">
          {favorites.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;