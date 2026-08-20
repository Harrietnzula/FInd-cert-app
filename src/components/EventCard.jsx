import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import "./EventCard.css";

function EventCard({ event }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(event.id);

  const dateObj = new Date(event.datetime_local);
  const dateFormatted = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const category = event.type?.replace(/_/g, " ") || "event";
  const image = event.performers?.[0]?.image;

  function handleFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(event);
  }

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <div className="event-card-art">
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="event-card-art-fallback">♪</div>
        )}
        <button
          className={`favorite-btn ${favorited ? "favorited" : ""}`}
          onClick={handleFavoriteClick}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          ♥
        </button>
      </div>

      <div className="event-card-body">
        <p className="event-card-category">{category}</p>
        <h3>{event.title}</h3>
        <p className="event-card-meta">{dateFormatted} · {event.venue?.city}</p>
      </div>
    </Link>
  );
}

export default EventCard;