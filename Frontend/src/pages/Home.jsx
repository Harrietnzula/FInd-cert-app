import { useState, useEffect, useRef } from "react";
import { fetchEvents, fetchFeaturedEvents } from "../api/seatgeek";
import EventCard from "../components/EventCard";
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
  const [popularEvents, setPopularEvents] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const featured = await fetchFeaturedEvents();
        const filteredFeatured = (featured || []).filter((event) => {
          const name = `${event.title || ""} ${event.performers?.[0]?.name || ""}`.toLowerCase();
          return ["concert", "festival"].includes(event.type) &&
            event.performers?.[0]?.image &&
            !/(chris brown|usher)/i.test(name);
        });

        const fallbackFeatured = [
          {
            id: "fallback-1",
            title: "Coachella Valley Music Festival",
            datetime_local: "2026-04-10T17:00:00",
            venue: { city: "Indio, CA", name: "Empire Polo Club" },
            performers: [{ image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80" }],
            type: "festival",
          },
          {
            id: "fallback-2",
            title: "Lollapalooza",
            datetime_local: "2026-08-01T12:00:00",
            venue: { city: "Chicago, IL", name: "Grant Park" },
            performers: [{ image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80" }],
            type: "festival",
          },
          {
            id: "fallback-3",
            title: "Rolling Loud Festival",
            datetime_local: "2026-03-14T14:00:00",
            venue: { city: "Miami, FL", name: "Hard Rock Stadium" },
            performers: [{ image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80" }],
            type: "festival",
          },
          {
            id: "fallback-4",
            title: "Ultra Music Festival",
            datetime_local: "2026-03-27T16:00:00",
            venue: { city: "Miami, FL", name: "Bayfront Park" },
            performers: [{ image: "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=900&q=80" }],
            type: "festival",
          },
          {
            id: "fallback-5",
            title: "Tomorrowland",
            datetime_local: "2026-07-18T18:00:00",
            venue: { city: "Boom, Belgium", name: "De Schorre" },
            performers: [{ image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=900&q=80" }],
            type: "festival",
          },
          {
            id: "fallback-6",
            title: "Governors Ball",
            datetime_local: "2026-06-07T12:00:00",
            venue: { city: "New York, NY", name: "Randall's Island Park" },
            performers: [{ image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80" }],
            type: "festival",
          },
          {
            id: "fallback-7",
            title: "Austin City Limits",
            datetime_local: "2026-10-02T16:30:00",
            venue: { city: "Austin, TX", name: "Zilker Park" },
            performers: [{ image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=900&q=80" }],
            type: "festival",
          },
          {
            id: "fallback-8",
            title: "Electric Forest",
            datetime_local: "2026-06-21T17:00:00",
            venue: { city: "Rothbury, MI", name: "Double JJ Ranch" },
            performers: [{ image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" }],
            type: "festival",
          },
        ];

        const featuredEvents = [...filteredFeatured, ...fallbackFeatured].slice(0, 8);
        setPopularEvents(featuredEvents);
      } catch (err) {
        console.error("Couldn't load featured events:", err);
      }
    }
    loadFeatured();
  }, []);

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
        <div className="hero-content">
          <div className="home-brand" aria-label="Riffs logo and name">
            <svg
              className="home-brand-icon"
              width="64"
              height="64"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 20C6 20 12 14 20 14C28 14 34 20 34 20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
              <path d="M6 20C6 20 12 26 20 26C28 26 34 20 34 20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
              <ellipse cx="20" cy="20" rx="6" ry="14" stroke="currentColor" strokeWidth="1" opacity="0.6" />
              <ellipse cx="20" cy="20" rx="14" ry="6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
              <circle cx="15" cy="14" r="1.3" fill="currentColor" />
              <circle cx="24" cy="12" r="1" fill="currentColor" />
            </svg>
            <h1 className="home-brand-wordmark">Riffs</h1>
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