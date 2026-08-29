const BASE_URL = 'https://api.seatgeek.com/2';
const CLIENT_ID = import.meta.env.VITE_SEATGEEK_CLIENT_ID;

// Search for events by keyword and return the results.
export async function fetchEvents(query) {
  const params = new URLSearchParams({
    q: query,
    per_page: '20',
    client_id: CLIENT_ID,
  });
  const response = await fetch(`${BASE_URL}/events?${params}`);

  if (!response.ok) {
    throw new Error(`Error searching events: ${response.statusText}`);
  }

  const data = await response.json();
  return data.events;
}

/**
 * Get a handful of popular upcoming events, for hero background images
 */
export async function fetchFeaturedEvents() {
  const url = `${BASE_URL}/events?sort=score.desc&per_page=10&client_id=${CLIENT_ID}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching featured events: ${response.statusText}`);
  }

  const data = await response.json();
  return data.events;
}

/**
 * Get upcoming events near a lat/lon coordinate, sorted by distance.
 * range is a SeatGeek-style radius string, e.g. "25mi" or "40km".
 */
export async function fetchNearbyEvents({ lat, lon, range = "25mi", perPage = 24 }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    range,
    sort: "datetime_local.asc",
    per_page: String(perPage),
    client_id: CLIENT_ID,
  });
  const response = await fetch(`${BASE_URL}/events?${params}`);

  if (!response.ok) {
    throw new Error(`Error fetching nearby events: ${response.statusText}`);
  }

  const data = await response.json();
  return data.events;
}

    // get event details by event ID and return the result
export async function fetchEventDetails(eventId) {
  const url = `${BASE_URL}/events/${eventId}?client_id=${CLIENT_ID}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching event details: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
