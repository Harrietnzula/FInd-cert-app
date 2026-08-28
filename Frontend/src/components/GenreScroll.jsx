import { useState } from "react";
import "./GenreScroll.css";

const GENRES = [
  { name: "Rock", icon: "🎸", color: "#ff5a3c" },
  { name: "Pop", icon: "🎤", color: "#ffd23f" },
  { name: "Hip-Hop", icon: "🎧", color: "#7ee787" },
  { name: "Country", icon: "🤠", color: "#ff9b71" },
  { name: "Jazz", icon: "🎷", color: "#79c0ff" },
  { name: "Electronic", icon: "🎛️", color: "#d4a5ff" },
  { name: "R&B", icon: "🎹", color: "#ff8fb1" },
  { name: "Latin", icon: "💃", color: "#ffb347" },
  { name: "Indie", icon: "🎵", color: "#8fe3c7" },
  { name: "Classical", icon: "🎻", color: "#c9b8ff" },
  { name: "Metal", icon: "🤘", color: "#ff6b6b" },
  { name: "Folk", icon: "🪕", color: "#c8e07a" },
];

function GenreScroll({ onSelectGenre }) {
  const [pressedGenre, setPressedGenre] = useState(null);

  function handleClick(genre) {
    setPressedGenre(genre.name);
    onSelectGenre(genre.name);
    setTimeout(() => setPressedGenre(null), 400);
  }

  return (
    <div className="genre-scroll">
      <h2>Browse by genre</h2>
      <div className="genre-grid">
        {GENRES.map((genre, i) => (
          <button
            key={genre.name}
            className={`genre-pill ${pressedGenre === genre.name ? "genre-pill-pressed" : ""}`}
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => handleClick(genre)}
          >
            <span className="genre-icon" style={{ background: genre.color }}>
              {genre.icon}
            </span>
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default GenreScroll;