import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { fetchKenyanEvents } from "../api/backend";
import "./Kenya.css";

const CITIES = ["", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];

function Kenya() {
  const [city, setCity] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchKenyanEvents({ city })
      .then((data) => setEvents(data.events))
      .catch((err) => {
        setEvents([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div className="kenya-page">
      <header className="kenya-header">
        <div>
          <p className="kenya-eyebrow">Kenya events</p>
          <h1>What&apos;s happening near you</h1>
        </div>
        <label>
          <span>City</span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            {CITIES.map((option) => (
              <option key={option} value={option}>{option || "All Kenya"}</option>
            ))}
          </select>
        </label>
      </header>

      {loading && <p className="status-message">Finding events in Kenya...</p>}
      {error && <p className="status-message error">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="status-message">No Kenyan events found right now.</p>
      )}
      {!loading && events.length > 0 && (
        <div className="event-list">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
}

export default Kenya;