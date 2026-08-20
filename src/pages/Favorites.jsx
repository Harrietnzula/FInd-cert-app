import { useFavorites } from "../context/FavoritesContext";
import EventCard from "../components/EventCard";
import { Link } from "react-router-dom";
import "./Favorites.css";

function Favorites() {
  const { favorites } = useFavorites();

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