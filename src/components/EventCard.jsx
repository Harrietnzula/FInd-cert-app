import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

function EventCard({ event }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(event.id);

  const dateFormatted = new Date(event.datetime_local).toLocaleDateString(
    "en-US",
    { weekday: "short", month: "short", day: "numeric", year: "numeric" }
  );

  function handleFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(event);
  }

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <button
        className={`favorite-btn ${favorited ? "favorited" : ""}`}
        onClick={handleFavoriteClick}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        ♥
      </button>
      <h3>{event.title}</h3>
      <p className="event-date">{dateFormatted}</p>
      <p className="event-venue">
        {event.venue?.name}, {event.venue?.city}
      </p>
    </Link>
  );
}

export default EventCard;