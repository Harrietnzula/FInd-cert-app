import { useState, useEffect } from "react";
import { fetchEvents, fetchFeaturedEvents } from "../api/seatgeek";
import EventCard from "../components/EventCard";
import "./Home.css";

function Home() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);const [heroImages, setHeroImages] = useState([]);
const [heroIndex, setHeroIndex] = useState(0);

// Fetch featured event images once, when the page first loads
useEffect(() => {
  async function loadHeroImages() {
    try {
      const featured = await fetchFeaturedEvents();
      const images = featured
        .map((event) => event.performers?.[0]?.image)
        .filter(Boolean); // remove any events with no image
      setHeroImages(images);
    } catch (err) {
      // fail silently — the hero just won't have a background if this fails
      console.error("Couldn't load hero images:", err);
    }
  }

  loadHeroImages();
}, []);

// Cycle to the next image every 5 seconds
useEffect(() => {
  if (heroImages.length === 0) return;

  const interval = setInterval(() => {
    setHeroIndex((prev) => (prev + 1) % heroImages.length);
  }, 5000);

  return () => clearInterval(interval);
}, [heroImages]);

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
  }return (
  <div className="home"><div className="hero">
  <div className="hero-bg">
    {heroImages.map((img, index) => (
      <div
        key={img}
        className={`hero-bg-image ${index === heroIndex ? "active" : ""}`}
        style={{ backgroundImage: `url(${img})` }}
      />
    ))}
    <div className="hero-bg-overlay" />
  </div>

  <div className="hero-content">
    <h1>Find your next <span>live</span> moment</h1>
    <p>Search concerts, festivals, and shows happening near you or anywhere else.</p>

    <form onSubmit={handleSearch} className="search-form">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search artist, venue, or team..."
      />
      <button type="submit">Search</button>
    </form>
  </div>
</div>
    {loading && <p className="status-message">Loading events...</p>}

    {error && <p className="status-message error">{error}</p>}

    {!loading && !error && hasSearched && events.length === 0 && (
      <p className="status-message">No events found. Try a different search.</p>
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