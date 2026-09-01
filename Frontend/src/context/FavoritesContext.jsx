import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

const FAVORITES_COLLECTION_NAME = "Favorites";

// Map a SavedEvent row from the backend into the same shape EventCard
// expects from a SeatGeek search result, so both can render identically.
function savedEventToEvent(saved) {
  return {
    id: saved.seatgeek_event_id,
    title: saved.event_name,
    datetime_local: saved.event_date,
    url: saved.event_url,
    venue: { name: saved.venue_name, city: saved.venue_city },
    performers: [{ image: saved.image_url }],
    _savedEventId: saved.id,
  };
}

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [collectionId, setCollectionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiRequest("/collections?per_page=50");
      let collection = list.collections.find((c) => c.name === FAVORITES_COLLECTION_NAME);

      if (!collection) {
        collection = await apiRequest("/collections", {
          method: "POST",
          body: { name: FAVORITES_COLLECTION_NAME, description: "Events you've saved" },
        });
      }

      const full = await apiRequest(`/collections/${collection.id}`);
      setCollectionId(full.id);
      setFavorites(full.saved_events.map(savedEventToEvent));
      return full.id;
    } catch (err) {
      console.error("Failed to load favorites:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
      setCollectionId(null);
    }
  }, [isAuthenticated, loadFavorites]);

  function isFavorite(eventId) {
    return favorites.some((e) => String(e.id) === String(eventId));
  }

  async function addFavorite(event) {
    const targetCollectionId = collectionId || (await loadFavorites());
    if (!targetCollectionId || isFavorite(event.id)) return;

    const saved = await apiRequest(`/collections/${targetCollectionId}/events`, {
      method: "POST",
      body: {
        seatgeek_event_id: String(event.id),
        event_name: event.title,
        event_date: event.datetime_local,
        venue_name: event.venue?.name,
        venue_city: event.venue?.city,
        event_url: event.url,
        image_url: event.performers?.[0]?.image,
      },
    });
    setFavorites((prev) => [...prev, savedEventToEvent(saved)]);
  }

  async function removeFavorite(eventId) {
    const existing = favorites.find((e) => String(e.id) === String(eventId));
    if (!existing) return;
    if (!existing._savedEventId) {
      await loadFavorites();
      throw new Error("Favorite data was out of date. Please try again.");
    }

    try {
      await apiRequest(`/events/${existing._savedEventId}`, { method: "DELETE" });
    } catch (error) {
      await loadFavorites();
      throw error;
    }
    setFavorites((prev) => prev.filter((e) => String(e.id) !== String(eventId)));
  }

  async function toggleFavorite(event) {
    if (isFavorite(event.id)) {
      await removeFavorite(event.id);
    } else {
      await addFavorite(event);
    }
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, isFavorite, toggleFavorite, addFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}