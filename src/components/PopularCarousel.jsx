import { useRef, useState } from "react";
import EventCard from "./EventCard";
import "./PopularCarousel.css";

function PopularCarousel({ events }) {
  const rowRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  if (events.length === 0) return null;

  function updateEdges() {
    const row = rowRef.current;
    if (!row) return;
    setAtStart(row.scrollLeft <= 4);
    setAtEnd(row.scrollLeft + row.clientWidth >= row.scrollWidth - 4);
  }

  function scrollByAmount(direction) {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="popular-carousel">
      <div className="popular-carousel-header">
        <h2>Popular right now</h2>
        <div className="popular-carousel-controls">
          <button
            className="carousel-arrow"
            onClick={() => scrollByAmount(-1)}
            disabled={atStart}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            className="carousel-arrow"
            onClick={() => scrollByAmount(1)}
            disabled={atEnd}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div
        className={`popular-carousel-row ${atStart ? "at-start" : ""} ${atEnd ? "at-end" : ""}`}
        ref={rowRef}
        onScroll={updateEdges}
      >
        {events.map((event) => (
          <div className="popular-carousel-item" key={event.id}>
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopularCarousel;