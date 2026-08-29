import { useEffect, useState } from "react";
import { fetchFeaturedEvents } from "../api/seatgeek";
import "./GlobalHeroBackground.css";

function GlobalHeroBackground() {
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchFeaturedEvents()
      .then((events) => {
        setImages(
          events
            .map((event) => event.performers?.[0]?.image)
            .filter(Boolean)
        );
      })
      .catch(() => setImages([]));
  }, []);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="global-hero-background" aria-hidden="true">
      {images.map((image, index) => (
        <div
          key={image}
          className={`global-hero-image ${index === activeIndex ? "active" : ""}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      <div className="global-hero-overlay" />
    </div>
  );
}

export default GlobalHeroBackground;