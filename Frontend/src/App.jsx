import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { CollectionsProvider } from "./context/CollectionsContext";
import Navbar from "./components/Navbar";
import Splash from "./components/Splash";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Nearby from "./pages/Nearby";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GlobalHeroBackground from "./components/GlobalHeroBackground";
import AppOpenSound from "./components/AppOpenSound";
import "./App.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CollectionsProvider>
          <BrowserRouter>
            <AppOpenSound />
            <GlobalHeroBackground />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/event/:id" element={<PageTransition><EventDetails /></PageTransition>} />
                <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/nearby" element={<PageTransition><Nearby /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
              </Routes>
            </main>
          </BrowserRouter>
        </CollectionsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;