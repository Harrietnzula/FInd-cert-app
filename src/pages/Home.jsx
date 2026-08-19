import { useState } from "react";
import { fetchEvents } from "../api/seatgeek";
import EventCard from "../components/EventCard";

function Home() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await fetchEvents(query);
      setEvents(results);
    } catch (err) {
      setError("Something went wrong fetching events. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home">
      <h1>Find your next gig</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artist, venue, or team..."
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading events...</p>}

      {error && <p className="error">{error}</p>}

      {!loading && !error && hasSearched && events.length === 0 && (
        <p>No events found. Try a different search.</p>
      )}

      <div className="event-list">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

export default Home;