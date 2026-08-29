import { useState, useEffect, useRef } from "react";
import { fetchEvents, fetchFeaturedEvents } from "../api/seatgeek";
import EventCard from "../components/EventCard";
import SparkleField from "../components/SparkleField";
import GenreScroll from "../components/GenreScroll";
import PopularCarousel from "../components/PopularCarousel";
import StoryBlock from "../components/StoryBlock";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import "./Home.css";

function Home() {
  const searchInputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [heroImages, setHeroImages] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [popularEvents, setPopularEvents] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const featured = await fetchFeaturedEvents();
        const images = featured
          .map((event) => event.performers?.[0]?.image)
          .filter(Boolean);
        setHeroImages(images);
        setPopularEvents(featured.slice(0, 8));
      } catch (err) {
        console.error("Couldn't load featured events:", err);
      }
    }
    loadFeatured();
  }, []);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages]);

  async function runSearch(term) {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const results = await fetchEvents(term);
      setEvents(results);
    } catch {
      setError("Something went wrong fetching events. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    runSearch(query);
  }

  function handleGetStarted() {
    setHasSearched(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  function handleGenreClick(genre) {
    setQuery(genre);
    runSearch(genre);
    setToastMessage(`Searching ${genre} events…`);
  }

  const storyImages = popularEvents
    .map((event) => event.performers?.[0]?.image)
    .filter(Boolean);

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-bg">
          {heroImages.map((img, index) => (
            <div
              key={img}
              className={`hero-bg-image ${index === heroIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="hero-bg-overlay" />
          <SparkleField count={40} />
        </div>

        <div className="hero-content">
          <div className="brand-wrap" aria-label="FindCert logo and name">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="FindCert logo icon">
                <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 20C6 20 12 14 20 14C28 14 34 20 34 20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <path d="M6 20C6 20 12 26 20 26C28 26 34 20 34 20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <ellipse cx="20" cy="20" rx="6" ry="14" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <ellipse cx="20" cy="20" rx="14" ry="6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <circle cx="15" cy="14" r="1.3" fill="currentColor" />
                <circle cx="24" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <div className="brand-copy">
              <h1 className="brand-wordmark">Find<span>Cert</span></h1>
            </div>
          </div>
          <p className="hero-intro-copy">
            Discover the next unforgettable live show and get tickets before the crowd does.
          </p>

          <button type="button" className="get-started-btn" onClick={handleGetStarted}>Get started</button>

          <form onSubmit={handleSearch} className="search-form">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artist, venue, or team..."
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>

      {!hasSearched && <GenreScroll onSelectGenre={handleGenreClick} />}

      {loading && <p className="status-message">Loading events...</p>}
      {error && <p className="status-message error">{error}</p>}
      {!loading && !error && hasSearched && events.length === 0 && (
        <p className="status-message">No events found. Try a different search.</p>
      )}

      {hasSearched && events.length > 0 && (
        <div className="event-list">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!hasSearched && <PopularCarousel events={popularEvents} />}

      {!hasSearched && (
        <>
          <StoryBlock
            eyebrow="Discover"
            title="Search by artist, venue, or genre"
            description="Type in who you want to see, and get straight to real dates, venues, and ticket links — no clutter, no ads."
            image={storyImages[0]}
          />
          <StoryBlock
            eyebrow="Organize"
            title="Save what catches your eye"
            description="Tap the heart on anything you like. Build a running shortlist of shows you don't want to miss."
            image={storyImages[1]}
            reverse
          />
          <StoryBlock
            eyebrow="Plan ahead"
            title="Never lose track of a show again"
            description="Come back anytime and pick up right where you left off — your favorites are always one tap away."
            image={storyImages[2]}
          />
        </>
      )}

      <Footer />
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}

export default Home;