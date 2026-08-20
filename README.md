# FindCert 🪩

A React app for discovering live concerts, festivals, and shows — search by artist, venue, or team, browse a rotating showcase of popular events, and save the ones you're interested in to a personal Favorites list.

**Live site:** [find-cert-app.vercel.app](https://find-cert-app.vercel.app) *(replace with your actual deployed URL)*

The idea came from a common complaint I kept seeing on Twitter — people frustrated with Ticketmaster's long queues and cluttered ticket listings just to find something worth going to. FindCert is a faster, cleaner way to discover live events, so you can find what you want without the wait and without the clutter.

Built as Phase 1 of a 3-phase capstone project. Favorites currently live in local React state; Phase 2 will move them to a Flask + database backend, and Phase 3 will tie them to authenticated user accounts.

## Features

- 🔍 Real-time search against the SeatGeek Platform API
- 🌆 Rotating hero background showcasing photos from popular upcoming events
- ⭐ "Popular right now" section on the homepage before you've searched
- 🎟️ Event detail pages with venue info, date/time, pricing, and ticket links
- ❤️ Favorite events from search results, the popular section, or the detail page
- ⚡ Loading, error, and empty states handled throughout
- 📱 Responsive layout that adapts from mobile to desktop
- 🪩 Custom disco-ball wordmark logo

## Tech Stack

- React (via Vite)
- React Router for client-side routing
- React Context for shared Favorites state
- SeatGeek Platform API for event data
- Plain CSS with custom properties (design tokens) — no utility framework

## Setup Instructions

1. Clone the repo:
   \`\`\`bash
   git clone https://github.com/Harrietnzula/FInd-cert-app.git
   cd gig-radar
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Get a free SeatGeek `client_id`:
   - Sign up at [seatgeek.com/build](https://seatgeek.com/build)
   - Create an app in your account's developer section
   - Copy your `client_id` (no secret key needed for this project)

4. Create a `.env` file in the project root:
   \`\`\`
   VITE_SEATGEEK_CLIENT_ID=your_client_id_here
   \`\`\`

5. Run the dev server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open `http://localhost:5173` in your browser.

## Deployment

Deployed on [Vercel](https://vercel.com), connected directly to this GitHub repo. Every push to `main` triggers an automatic rebuild and redeploy.

If deploying your own copy, remember to add `VITE_SEATGEEK_CLIENT_ID` under your Vercel project's **Settings → Environment Variables** — Vite environment variables are baked in at build time, so the variable must be set *before* the build runs, and a new deploy is required any time the value changes.

## API Used

**SeatGeek Platform API** — [platform.seatgeek.com](https://platform.seatgeek.com/)

Endpoints used:
- `GET /2/events?q={query}&client_id={id}` — search events by keyword
- `GET /2/events/{id}?client_id={id}` — get details for a single event
- `GET /2/events?sort=score.desc&per_page=10&client_id={id}` — fetch popular events for the homepage's hero background and "Popular right now" section

## Known Issues / Limitations

- Favorites are stored in React state only and reset on page refresh (by design — this is Phase 1; persistence is planned for Phase 2)
- Some SeatGeek events are missing performer images; these fall back to a placeholder icon
- No pagination yet — search returns SeatGeek's default result set (first page only)
- No debouncing on search input; each submit triggers a fresh request

## Project Structure

\`\`\`
src/
├── api/          # SeatGeek API calls (fetchEvents, fetchEventDetails, fetchFeaturedEvents)
├── components/   # Reusable UI (Navbar, EventCard)
├── context/      # FavoritesContext (shared favorites state via React Context)
├── pages/        # Route-level views (Home, EventDetails, Favorites)
└── App.jsx       # Root component, routing setup
\`\`\`

## Roadmap

- **Phase 2:** Flask backend + database — persist favorites server-side
- **Phase 3:** User authentication — tie favorites to individual logged-in users