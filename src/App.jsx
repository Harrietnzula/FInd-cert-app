import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "./context/FavoritesContext";
import { CollectionsProvider } from "./context/CollectionsContext";
import Navbar from "./components/Navbar";
import Splash from "./components/Splash";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Favorites from "./pages/Favorites";
import "./App.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <FavoritesProvider>
      <CollectionsProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/event/:id" element={<PageTransition><EventDetails /></PageTransition>} />
              <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
            </Routes>
          </main>
        </BrowserRouter>
      </CollectionsProvider>
    </FavoritesProvider>
  );
}

export default App;