import { useEffect, useState } from "react";
import { fetchFeaturedEvents } from "../api/seatgeek";
import "./GlobalHeroBackground.css";

function GlobalHeroBackground() {
  const [image, setImage] = useState("");

  useEffect(() => {
    fetchFeaturedEvents()
      .then((events) => {
        const images = (events || [])
          .map((event) => event.performers?.[0]?.image)
          .filter(Boolean);
        setImage(images[Math.floor(Math.random() * images.length)] || "");
      })
      .catch(() => setImage(""));
  }, []);

  return (
    <div
      className="global-hero-background"
      aria-hidden="true"
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className="global-hero-overlay" />
    </div>
  );
}

export default GlobalHeroBackground;