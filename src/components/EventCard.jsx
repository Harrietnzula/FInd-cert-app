import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import ConfettiBurst from "./ConfettiBurst";
import "./EventCard.css";

function EventCard({ event, variant = "default", index = 0 }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const favorited = isFavorite(event.id);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [burstTrigger, setBurstTrigger] = useState(0);

  const dateFormatted = new Date(event.datetime_local).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" }
  );

  const category = event.type?.replace(/_/g, " ") || "event";
  const image = event.performers?.[0]?.image;

  async function handleFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const wasFavorited = favorited;
    try {
      await toggleFavorite(event);
      if (!wasFavorited) {
        setBurstTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  }

  function handleMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const strength = variant === "pop" ? 22 : 14;

    const rotateY = ((x / rect.width) - 0.5) * strength;
    const rotateX = ((y / rect.height) - 0.5) * -strength;

    setTilt({ x: rotateX, y: rotateY });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <Link
      to={`/event/${event.id}`}
      className={`event-card ${variant === "pop" ? "event-card-pop" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        animationDelay: variant === "pop" ? `${index * 0.08}s` : undefined,
      }}
    >
      <div className="event-card-art">
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="event-card-art-fallback">♪</div>
        )}
        <button
          className={`favorite-btn ${favorited ? "favorited" : ""}`}
          onClick={handleFavoriteClick}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          ♥
          <ConfettiBurst trigger={burstTrigger} />
        </button>
      </div>

      <div className="event-card-body">
        <p className="event-card-category">{category}</p>
        <h3>{event.title}</h3>
        <p className="event-card-meta">{dateFormatted} · {event.venue?.city}</p>
      </div>
    </Link>
  );
}

export default EventCard;