import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchEventDetails } from "../api/seatgeek";
import { useFavorites } from "../context/FavoritesContext";

function EventDetails() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEventDetails(id);
        setEvent(data);
      } catch (err) {
        setError("Couldn't load this event. It may no longer be available.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  if (loading) return <p className="status-message">Loading event...</p>;
  if (error) return <p className="status-message error">{error}</p>;
  if (!event) return null;

  const dateFormatted = new Date(event.datetime_local).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
  );

  const favorited = isFavorite(event.id);

  return (
    <div className="event-details">
      <Link to="/" className="back-link">← Back to search</Link>

      <h1>{event.title}</h1>
      <p className="event-date">{dateFormatted}</p>
      <p className="event-venue">
        {event.venue?.name} — {event.venue?.address}, {event.venue?.city}, {event.venue?.state}
      </p>

      <button
        className={`favorite-btn-large ${favorited ? "favorited" : ""}`}
        onClick={() => toggleFavorite(event)}
      >
        {favorited ? "♥ Saved to Favorites" : "♡ Add to Favorites"}
      </button>

      {event.stats?.lowest_price && (
        <p className="price-range">
          Tickets from ${event.stats.lowest_price}
        </p>
      )}

      <a href={event.url} target="_blank" rel="noopener noreferrer" className="ticket-link">
        View tickets on SeatGeek →
      </a>
    </div>
  );
}

export default EventDetails;