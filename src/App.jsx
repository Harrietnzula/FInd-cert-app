import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Favorites from "./pages/Favorites";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;