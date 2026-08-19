import { useFavorites } from "../context/FavoritesContext";
import EventCard from "../components/EventCard";
import { Link } from "react-router-dom";

function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="favorites-page">
      <h1>Your Favorites</h1>

      {favorites.length === 0 ? (
        <p className="status-message">
          No favorites yet. <Link to="/">Search for events</Link> and tap the heart to save them here.
        </p>
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