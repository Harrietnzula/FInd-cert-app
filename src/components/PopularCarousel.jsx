import EventCard from "./EventCard";
import "./PopularCarousel.css";

function PopularCarousel({ events }) {
  if (events.length === 0) return null;

  return (
    <div className="popular-carousel">
      <h2>Popular right now</h2>
      <div className="popular-carousel-row">
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