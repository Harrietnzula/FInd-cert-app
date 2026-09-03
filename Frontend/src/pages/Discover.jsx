import { useEffect, useState } from "react";
import { fetchFeaturedEvents } from "../api/seatgeek";
import Footer from "../components/Footer";
import "./Discover.css";

const CIRCLES = [
  {
    id: "alt-pop",
    genre: "Alternative + Indie",
    title: "The after-hours setlist",
    description: "For people who like hazy guitars, intimate rooms, and discovering the next big thing early.",
    members: "2.4k",
    color: "coral",
  },
  {
    id: "hip-hop",
    genre: "Hip-Hop + R&B",
    title: "Front row energy",
    description: "Trade tour dates, pre-show rituals, and the artists keeping the whole room moving.",
    members: "3.8k",
    color: "gold",
  },
  {
    id: "dance",
    genre: "Electronic + Dance",
    title: "Neon until sunrise",
    description: "Find festival friends and late-night sets built for big speakers and bigger memories.",
    members: "1.9k",
    color: "blue",
  },
  {
    id: "live-classics",
    genre: "Live Classics",
    title: "Songs that raised us",
    description: "A community for iconic tours, unforgettable voices, and the shows worth traveling for.",
    members: "4.1k",
    color: "violet",
  },
];

function Discover() {
  const [events, setEvents] = useState([]);
  const [joinedCircles, setJoinedCircles] = useState([]);

  useEffect(() => {
    fetchFeaturedEvents()
      .then((featured) => setEvents((featured || []).slice(0, 4)))
      .catch(() => setEvents([]));
  }, []);

  function toggleCircle(circleId) {
    setJoinedCircles((current) => (
      current.includes(circleId)
        ? current.filter((id) => id !== circleId)
        : [...current, circleId]
    ));
  }

  return (
    <div className="discover-page">
      <section className="discover-intro">
        <p className="discover-eyebrow">Find your people</p>
        <h1>Discover your<br /><span>concert community.</span></h1>
        <p className="discover-lead">
          Meet people who get excited about the same artists, scenes, and live moments you do.
        </p>
      </section>

      <section className="discover-circles" aria-labelledby="circles-heading">
        <div className="discover-section-heading">
          <div>
            <p className="discover-eyebrow">Interest circles</p>
            <h2 id="circles-heading">Where your next show starts</h2>
          </div>
          <span className="discover-count">{joinedCircles.length} joined</span>
        </div>

        <div className="circle-grid">
          {CIRCLES.map((circle) => {
            const joined = joinedCircles.includes(circle.id);
            return (
              <article className={`circle-card circle-card-${circle.color}`} key={circle.id}>
                <div className="circle-card-glow" aria-hidden="true" />
                <div className="circle-card-topline">
                  <span>{circle.genre}</span>
                  <span className="circle-status">{joined ? "Joined" : "Open"}</span>
                </div>
                <h3>{circle.title}</h3>
                <p>{circle.description}</p>
                <div className="circle-card-footer">
                  <span className="circle-members">{circle.members} listeners</span>
                  <button type="button" onClick={() => toggleCircle(circle.id)}>
                    {joined ? "Leave circle" : "Join circle"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {events.length > 0 && (
        <section className="discover-events" aria-labelledby="events-heading">
          <div className="discover-section-heading">
            <div>
              <p className="discover-eyebrow">Live now</p>
              <h2 id="events-heading">What the community is watching</h2>
            </div>
          </div>
          <div className="discover-event-strip">
            {events.map((event) => (
              <div className="discover-event" key={event.id}>
                {event.performers?.[0]?.image ? (
                  <img src={event.performers[0].image} alt="" loading="lazy" />
                ) : (
                  <div className="discover-event-fallback">♪</div>
                )}
                <div>
                  <strong>{event.title}</strong>
                  <span>{event.venue?.city || "Live event"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default Discover;