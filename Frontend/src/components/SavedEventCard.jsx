import { Link } from "react-router-dom";
import "./SavedEventCard.css";

/**
 * Renders an event that came back from OUR backend (a SavedEvent or a
 * RecentEvent row) rather than raw SeatGeek search-result shape. Both
 * share the same field names (event_name, event_date, venue_name, ...),
 * which is what makes one card usable for both.
 */
function SavedEventCard({ event, onRemove, removeLabel = "Remove" }) {
  const dateFormatted = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="saved-event-card">
      <Link to={`/event/${event.seatgeek_event_id}`} className="saved-event-card-link">
        <div className="saved-event-card-art">
          {event.image_url ? (
            <img src={event.image_url} alt="" loading="lazy" />
          ) : (
            <div className="saved-event-card-art-fallback">♪</div>
          )}
        </div>
        <div className="saved-event-card-body">
          <h4>{event.event_name}</h4>
          <p className="saved-event-card-meta">
            {dateFormatted}
            {dateFormatted && event.venue_city ? " · " : ""}
            {event.venue_city}
          </p>
        </div>
      </Link>
      {onRemove && (
        <button
          className="saved-event-card-remove"
          onClick={() => onRemove(event)}
          aria-label={removeLabel}
          title={removeLabel}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SavedEventCard;
