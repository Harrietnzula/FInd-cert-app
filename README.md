# FindCert 🎫

A React app for discovering live concerts, festivals, and shows — search by artist, venue, or team, browse results in a clean visual grid, and save events to a personal Favorites list.

Built as Phase 1 of a 3-phase capstone project. Favorites currently live in local React state; Phase 2 will move them to a Flask + database backend, and Phase 3 will tie them to authenticated user accounts.

## Features

- 🔍 Real-time search against the SeatGeek Platform API
- 🎟️ Event detail pages with venue info, date/time, and ticket links
- ❤️ Favorite events from search results or the detail page
- ⚡ Loading, error, and empty states handled throughout
- 📱 Responsive layout (grid adapts from mobile to desktop)

## Tech Stack

- React (via Vite)
- React Router for client-side routing
- React Context for shared Favorites state
- SeatGeek Platform API for event data

## Setup Instructions

1. Clone the repo:
```bash
   git clone https://github.com/YOUR_USERNAME/gig-radar.git
   cd gig-radar
```

2. Install dependencies:
```bash
   npm install
```

3. Get a free SeatGeek `client_id`:
   - Sign up at [seatgeek.com/build](https://seatgeek.com/build)
   - Create an app in your account's developer section
   - Copy your `client_id` (no secret key needed for this project)

4. Create a `.env` file in the project root:

VITE_SEATGEEK_CLIENT_ID=your_client_id_here


5. Run the dev server:
```bash
   npm run dev
```

6. Open `http://localhost:5173` in your browser.

## API Used

**SeatGeek Platform API** — [platform.seatgeek.com](https://platform.seatgeek.com/)

Endpoints used:
- `GET /2/events?q={query}&client_id={id}` — search events by keyword
- `GET /2/events/{id}?client_id={id}` — get details for a single event

## Known Issues / Limitations

- Favorites are stored in React state only and reset on page refresh (by design — this is Phase 1; persistence is planned for Phase 2)
- Some SeatGeek events are missing performer images; these fall back to a placeholder icon
- No pagination yet — search returns SeatGeek's default result set

## Project Structure

src/
├── api/ # SeatGeek API calls (fetchEvents, fetchEventDetails)
├── components/ # Reusable UI (Navbar, EventCard)
├── context/ # FavoritesContext (shared favorites state)
├── pages/ # Route-level views (Home, EventDetails, Favorites)
└── App.jsx # Root component, routing setup