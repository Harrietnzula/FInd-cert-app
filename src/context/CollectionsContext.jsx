import { createContext, useContext, useState } from "react";

const CollectionsContext = createContext();

export function CollectionsProvider({ children }) {
  const [collections, setCollections] = useState([
    { id: "bucket-list", name: "Bucket List", events: [] },
  ]);

  function createCollection(name) {
    const newCollection = {
      id: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name,
      events: [],
    };
    setCollections((prev) => [...prev, newCollection]);
    return newCollection.id;
  }

  function addToCollection(collectionId, event) {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId && !c.events.some((e) => e.id === event.id)
          ? { ...c, events: [...c.events, event] }
          : c
      )
    );
  }

  function removeFromCollection(collectionId, eventId) {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? { ...c, events: c.events.filter((e) => e.id !== eventId) }
          : c
      )
    );
  }

  function isInCollection(collectionId, eventId) {
    const collection = collections.find((c) => c.id === collectionId);
    return collection ? collection.events.some((e) => e.id === eventId) : false;
  }

  return (
    <CollectionsContext.Provider
      value={{ collections, createCollection, addToCollection, removeFromCollection, isInCollection }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  return useContext(CollectionsContext);
}