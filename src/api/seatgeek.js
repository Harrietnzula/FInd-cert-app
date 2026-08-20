const BASE_URL = 'https://api.seatgeek.com/2';
const CLIENT_ID = import.meta.env.VITE_SEATGEEK_CLIENT_ID;

// search for events by keyword (e.g., artist name, venue, etc.) and return the results

export async function fetchEvents(query) {
  const url = `${BASE_URL}/events?client_id=${CLIENT_ID}&q=${query}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching events: ${response.statusText}`);
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
