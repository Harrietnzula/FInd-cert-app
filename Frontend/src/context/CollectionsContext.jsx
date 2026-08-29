import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as api from "../api/backend";

const CollectionsContext = createContext();

// Map a SeatGeek event object (as used elsewhere in the app) to the shape
// the backend's /collections/:id/events endpoint expects.
function toSavedEventPayload(event) {
  return {
    seatgeek_event_id: String(event.id),
    event_name: event.title,
    event_date: event.datetime_local,
    venue_name: event.venue?.name,
    venue_city: event.venue?.city,
    event_url: event.url,
    image_url: event.performers?.[0]?.image,
  };
}

export function CollectionsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshCollections = useCallback(async () => {
    if (!isAuthenticated) {
      setCollections([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch each collection with its events included so isInCollection
      // can check membership without an extra round trip per collection.
      const { collections: summaries } = await api.fetchCollections({ perPage: 50 });
      const full = await Promise.all(
        summaries.map((c) => api.fetchCollection(c.id))
      );
      setCollections(full);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  async function createCollection(name) {
    const collection = await api.createCollection({ name });
    setCollections((prev) => [...prev, { ...collection, saved_events: [] }]);
    return collection.id;
  }

  async function addToCollection(collectionId, event) {
    const saved = await api.addSavedEvent(collectionId, toSavedEventPayload(event));
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? { ...c, saved_events: [...(c.saved_events || []), saved] }
          : c
      )
    );
  }

  async function deleteCollection(collectionId) {
    await api.deleteCollection(collectionId);
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
  }

  async function removeFromCollection(collectionId, seatgeekEventId) {
    const collection = collections.find((c) => c.id === collectionId);
    const saved = collection?.saved_events?.find(
      (e) => e.seatgeek_event_id === String(seatgeekEventId)
    );
    if (!saved) return;
    await api.removeSavedEvent(saved.id);
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? { ...c, saved_events: c.saved_events.filter((e) => e.id !== saved.id) }
          : c
      )
    );
  }

  function isInCollection(collectionId, eventId) {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return false;
    return (collection.saved_events || []).some(
      (e) => e.seatgeek_event_id === String(eventId)
    );
  }

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        loading,
        error,
        createCollection,
        deleteCollection,
        addToCollection,
        removeFromCollection,
        isInCollection,
        refreshCollections,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  return useContext(CollectionsContext);
}
