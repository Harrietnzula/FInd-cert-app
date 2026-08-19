import { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  function addFavorite(event) {
    setFavorites((prev) => [...prev, event]);
  }

  function removeFavorite(eventId) {
    setFavorites((prev) => prev.filter((e) => e.id !== eventId));
  }

  function isFavorite(eventId) {
    return favorites.some((e) => e.id === eventId);
  }

  function toggleFavorite(event) {
    if (isFavorite(event.id)) {
      removeFavorite(event.id);
    } else {
      addFavorite(event);
    }
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}