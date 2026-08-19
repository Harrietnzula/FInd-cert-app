import { Link } from "react-router-dom";

function EventCard({ event }) {
  const dateFormatted = new Date(event.datetime_local).toLocaleDateString(
    "en-US",
    { weekday: "short", month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <h3>{event.title}</h3>
      <p>{dateFormatted}</p>
      <p>
        {event.venue?.name}, {event.venue?.city}
      </p>
    </Link>
  );
}

export default EventCard;