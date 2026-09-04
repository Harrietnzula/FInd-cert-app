import { useEffect, useState } from "react";
import { fetchFeaturedEvents } from "../api/seatgeek";
import { fetchCommunityMessages, sendCommunityMessage } from "../api/backend";
import { useAuth } from "../context/AuthContext";
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
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [joinedCircles, setJoinedCircles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("riffs:joined-circles") || "[]");
    } catch {
      return [];
    }
  });
  const [activeCircleId, setActiveCircleId] = useState(CIRCLES[0].id);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchFeaturedEvents()
      .then((featured) => setEvents((featured || []).slice(0, 4)))
      .catch(() => setEvents([]));
  }, []);

  function toggleCircle(circleId) {
    setJoinedCircles((current) => {
      const next = current.includes(circleId)
        ? current.filter((id) => id !== circleId)
        : [...current, circleId];
      localStorage.setItem("riffs:joined-circles", JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    async function loadMessages(showLoading = false) {
      if (showLoading) setMessagesLoading(true);
      try {
        const data = await fetchCommunityMessages(activeCircleId);
        if (!cancelled) setMessages(data.messages || []);
      } catch (error) {
        if (!cancelled) setMessageError(error.message);
      } finally {
        if (showLoading && !cancelled) setMessagesLoading(false);
      }
    }
    setMessageError("");
    loadMessages(true);
    const interval = setInterval(() => loadMessages(), 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeCircleId, isAuthenticated]);

  async function handleSendMessage(event) {
    event.preventDefault();
    const body = messageBody.trim();
    if (!body || sending) return;
    setSending(true);
    setMessageError("");
    try {
      const message = await sendCommunityMessage(activeCircleId, body);
      setMessages((current) => [...current, message]);
      setMessageBody("");
    } catch (error) {
      setMessageError(error.message);
    } finally {
      setSending(false);
    }
  }

  const activeCircle = CIRCLES.find((circle) => circle.id === activeCircleId);

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
                <button
                  type="button"
                  className="circle-chat-link"
                  onClick={() => setActiveCircleId(circle.id)}
                >
                  {activeCircleId === circle.id ? "Viewing conversation" : "Open conversation"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="discover-chat" aria-labelledby="chat-heading">
        <div className="discover-section-heading">
          <div>
            <p className="discover-eyebrow">Community room</p>
            <h2 id="chat-heading">{activeCircle?.title}</h2>
          </div>
          <span className="discover-count">{activeCircle?.genre}</span>
        </div>
        <div className="chat-panel">
          <div className="chat-messages" aria-live="polite">
            {!isAuthenticated ? (
              <p className="chat-empty">Log in to join the conversation.</p>
            ) : messagesLoading ? (
              <p className="chat-empty">Loading the room...</p>
            ) : messages.length === 0 ? (
              <p className="chat-empty">Be the first to share a concert thought here.</p>
            ) : (
              messages.map((message) => (
                <article className={`chat-message ${message.author_id === user?.id ? "chat-message-own" : ""}`} key={message.id}>
                  <div className="chat-message-meta">
                    <strong>{message.author}</strong>
                    <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
                  </div>
                  <p>{message.body}</p>
                </article>
              ))
            )}
          </div>
          {isAuthenticated && (
            <form className="chat-form" onSubmit={handleSendMessage}>
              <input
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                maxLength={500}
                placeholder={`Say something to ${activeCircle?.genre} listeners...`}
                aria-label="Community message"
              />
              <button type="submit" disabled={sending || !messageBody.trim()}>
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          )}
          {messageError && <p className="chat-error">{messageError}</p>}
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