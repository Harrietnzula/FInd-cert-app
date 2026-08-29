import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchEventDetails } from "../api/seatgeek";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import { useCollections } from "../context/CollectionsContext";
import { recordRecent } from "../api/backend";
import "./EventDetails.css";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { collections, createCollection, addToCollection, isInCollection } = useCollections();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [collectionMessage, setCollectionMessage] = useState("");
  const [collectionSaving, setCollectionSaving] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEventDetails(id);
        setEvent(data);
      } catch {
        setError("Couldn't load this event. It may no longer be available.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  // Log this as a "recently viewed" event for the signed-in user's
  // Profile > Recents tab. Silently skipped if not logged in, and any
  // failure here shouldn't block the page from rendering the event.
  useEffect(() => {
    if (!isAuthenticated || !event) return;
    recordRecent({
      seatgeek_event_id: String(event.id),
      event_name: event.title,
      event_date: event.datetime_local,
      venue_name: event.venue?.name,
      venue_city: event.venue?.city,
      event_url: event.url,
      image_url: event.performers?.[0]?.image,
      performer_name: event.performers?.[0]?.name,
    }).catch(() => {});
  }, [isAuthenticated, event]);

  if (loading) return <p className="status-message">Loading event...</p>;
  if (error) return <p className="status-message error">{error}</p>;
  if (!event) return null;

  const dateFormatted = new Date(event.datetime_local).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
  );

  const favorited = isFavorite(event.id);
  const image = event.performers?.[0]?.image;
  const category = event.type?.replace(/_/g, " ") || "event";

  async function handleAddToCollection() {
    if (!selectedCollectionId) return;
    if (isInCollection(Number(selectedCollectionId), event.id)) {
      setCollectionMessage("This event is already in that collection");
      return;
    }
    setCollectionSaving(true);
    setCollectionMessage("");
    try {
      await addToCollection(Number(selectedCollectionId), event);
      setCollectionMessage("Added to collection");
    } catch (err) {
      setCollectionMessage(err.message);
    } finally {
      setCollectionSaving(false);
    }
  }

  async function handleCreateCollection(e) {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;
    setCollectionSaving(true);
    setCollectionMessage("");
    try {
      const id = await createCollection(name);
      setSelectedCollectionId(String(id));
      setNewCollectionName("");
      await addToCollection(id, event);
      setCollectionMessage("Collection created and event added");
    } catch (err) {
      setCollectionMessage(err.message);
    } finally {
      setCollectionSaving(false);
    }
  }

  return (
    <div className="event-details">
      <Link to="/" className="back-link">← Back to search</Link>

      <div className="event-details-layout">
        <div className="event-details-art">
          {image ? (
            <img src={image} alt="" />
          ) : (
            <div className="event-details-art-fallback">♪</div>
          )}
        </div>

        <div className="event-details-info">
          <p className="event-details-category">{category}</p>
          <h1>{event.title}</h1>
          <p className="event-details-date">{dateFormatted}</p>
          <p className="event-details-venue">
            {event.venue?.name} — {event.venue?.address}, {event.venue?.city}, {event.venue?.state}
          </p>

          <div className="event-details-actions">
            <button
              className={`favorite-btn-large ${favorited ? "favorited" : ""}`}
              onClick={async () => {
                if (!isAuthenticated) {
                  navigate("/login");
                  return;
                }
                try {
                  await toggleFavorite(event);
                } catch (err) {
                  setCollectionMessage(err.message || "Could not save favorite");
                }
              }}
            >
              {favorited ? "♥ Saved to favorites" : "♡ Add to favorites"}
            </button>

            <a href={event.url} target="_blank" rel="noopener noreferrer" className="ticket-link">
              View tickets on SeatGeek →
            </a>
          </div>

          {event.stats?.lowest_price && (
            <p className="price-range">
              Tickets from <span>${event.stats.lowest_price}</span>
            </p>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="event-collection-picker">
          <div className="event-collection-heading">
            <span className="event-collection-icon">✦</span>
            <div>
              <h2>Build your setlist</h2>
              <p>Keep this event with the shows you want to remember.</p>
            </div>
          </div>
          <label htmlFor="event-collection">Save to a collection</label>
          <div className="event-collection-row">
            <select
              id="event-collection"
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
            >
              <option value="">Choose a collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}{isInCollection(collection.id, event.id) ? " (saved)" : ""}
                </option>
              ))}
            </select>
            <button
              className="event-collection-add"
              onClick={handleAddToCollection}
              disabled={!selectedCollectionId || collectionSaving}
            >
              {collectionSaving ? "Saving..." : "Add event"}
            </button>
          </div>
          {collectionMessage && <p className="event-collection-message">{collectionMessage}</p>}
          <form className="event-new-collection-form" onSubmit={handleCreateCollection}>
            <input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Or create a new collection"
              aria-label="New collection name"
            />
            <button type="submit" disabled={!newCollectionName.trim() || collectionSaving}>
              Create and add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default EventDetails;