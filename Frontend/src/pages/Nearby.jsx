import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import { fetchNearbyEvents } from "../api/seatgeek";
import "leaflet/dist/leaflet.css";
import "./Nearby.css";

// Leaflet's default marker icons reference image URLs that don't resolve
// correctly once bundled by Vite — point them at the actual asset URLs.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function RecenterOnChange({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function Nearby() {
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | locating | granted | denied
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("25mi");

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setError("Your browser doesn't support location access.");
      return;
    }
    setLocationStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
        setError("Location access was denied. You can still browse by searching on the Home page.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError(null);
    fetchNearbyEvents({ lat: coords.lat, lon: coords.lon, range })
      .then(setEvents)
      .catch(() => setError("Couldn't load nearby events. Please try again."))
      .finally(() => setLoading(false));
  }, [coords, range]);

  const mapCenter = useMemo(
    () => (coords ? [coords.lat, coords.lon] : [0, 0]),
    [coords]
  );

  return (
    <div className="nearby-page">
      <h1>Concerts near you</h1>
      <p className="nearby-subtext">
        Share your location to see what's happening around you right now.
      </p>

      {locationStatus === "idle" && (
        <button className="nearby-locate-btn" onClick={requestLocation}>
          Use my location
        </button>
      )}

      {locationStatus === "locating" && (
        <p className="status-message">Getting your location…</p>
      )}

      {error && <p className="status-message error">{error}</p>}

      {coords && (
        <>
          <div className="nearby-range-select">
            <label htmlFor="range">Radius</label>
            <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="5mi">5 mi</option>
              <option value="10mi">10 mi</option>
              <option value="25mi">25 mi</option>
              <option value="50mi">50 mi</option>
              <option value="100mi">100 mi</option>
            </select>
          </div>

          <div className="nearby-map-wrap">
            <MapContainer center={mapCenter} zoom={11} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterOnChange center={mapCenter} />
              <Marker position={mapCenter} icon={markerIcon}>
                <Popup>You are here</Popup>
              </Marker>
              {events.map((event) => {
                const lat = event.venue?.location?.lat;
                const lon = event.venue?.location?.lon;
                if (!lat || !lon) return null;
                return (
                  <Marker key={event.id} position={[lat, lon]} icon={markerIcon}>
                    <Popup>
                      <strong>{event.title}</strong>
                      <br />
                      {event.venue?.name}
                      <br />
                      <Link to={`/event/${event.id}`}>View details →</Link>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {loading && <p className="status-message">Finding events near you…</p>}

          {!loading && events.length === 0 && (
            <p className="status-message">No events found nearby. Try widening the radius.</p>
          )}

          {!loading && events.length > 0 && (
            <ul className="nearby-events-list">
              {events.map((event) => (
                <li key={event.id}>
                  <Link to={`/event/${event.id}`} className="nearby-event-row">
                    <span className="nearby-event-name">{event.title}</span>
                    <span className="nearby-event-meta">
                      {event.venue?.name} · {event.venue?.city}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default Nearby;
