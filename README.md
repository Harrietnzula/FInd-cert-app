# FindCert 🪩

A React app for discovering live concerts, festivals, and shows — search by artist, venue, or team, browse a rotating showcase of popular events, and save the ones you're interested in to personal collections tied to your account.

**Live site:** [f-ind-cert-app.vercel.app](https://f-ind-cert-app.vercel.app)
**Backend API:** [find-cert-app-1.onrender.com](https://find-cert-app-1.onrender.com)

The idea came from a common complaint I kept seeing on Twitter — people frustrated with Ticketmaster's long queues and cluttered ticket listings just to find something worth going to. FindCert is a faster, cleaner way to discover live events, so you can find what you want without the wait and without the clutter.

Built as a multi-phase capstone project. Phase 1 shipped the React frontend with local-state favorites. Phase 2 (current) adds a Flask + PostgreSQL backend with real user accounts and persistent, per-user collections.

## Features

- 🔍 Real-time search against the SeatGeek Platform API
- 🌆 Rotating hero background showcasing photos from popular upcoming events
- ⭐ "Popular right now" section on the homepage before you've searched
- 🎟️ Event detail pages with venue info, date/time, pricing, and ticket links
- ❤️ Favorite events from search results, the popular section, or the detail page
- 🔐 User accounts — sign up, log in, log out (session-based auth)
- 📁 Named collections (e.g. "Bucket List") saved server-side per user, persisting across devices and sessions
- ⚡ Loading, error, and empty states handled throughout
- 📱 Responsive layout that adapts from mobile to desktop
- 🪩 Custom disco-ball wordmark logo

## Tech Stack

**Frontend**
- React (via Vite)
- React Router for client-side routing
- React Context for shared Auth, Favorites, and Collections state
- SeatGeek Platform API for event data
- Plain CSS with custom properties (design tokens) — no utility framework
- Deployed on Vercel

**Backend**
- Flask (app factory pattern, blueprints)
- Flask-SQLAlchemy (ORM) + Flask-Migrate (Alembic migrations)
- Flask-Login (session-based auth) + Flask-Bcrypt (password hashing)
- Flask-Cors (cross-origin requests from the Vercel frontend, with credentials)
- PostgreSQL
- Deployed on Render

## Setup Instructions

### Frontend

1. Clone the repo:
   ```bash
   git clone https://github.com/Harrietnzula/FInd-cert-app.git
   cd FInd-cert-app
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
   ```
   VITE_SEATGEEK_CLIENT_ID=your_client_id_here
   VITE_API_BASE_URL=http://localhost:5555
   ```

5. Run the dev server:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:5173` in your browser.

### Backend

See [`backend/BACKEND_README.md`](./backend/BACKEND_README.md) for full setup, API endpoint docs, and the auth model. Quick start:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in real values
export FLASK_APP=run.py
flask db upgrade
python run.py
```

The API runs at `http://localhost:5555` by default.

## Deployment

**Frontend** is deployed on [Vercel](https://vercel.com), connected directly to this repo's `main` branch. Every push triggers an automatic rebuild and redeploy.

Required Vercel environment variables (Settings → Environment Variables):
| Variable | Value |
|---|---|
| `VITE_SEATGEEK_CLIENT_ID` | your SeatGeek client ID |
| `VITE_API_BASE_URL` | `https://find-cert-app-1.onrender.com` |

Vite environment variables are baked in at build time, so a new deploy is required any time a value changes.

**Backend** is deployed on [Render](https://render.com) as a Web Service, with a separate Render PostgreSQL instance for the database.

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn run:app`

Required Render environment variables:
| Variable | Value |
|---|---|
| `SECRET_KEY` | a long random string |
| `DATABASE_URL` | the Postgres instance's Internal Database URL |
| `CORS_ORIGINS` | `https://f-ind-cert-app.vercel.app` |
| `SESSION_COOKIE_SAMESITE` | `None` |
| `SESSION_COOKIE_SECURE` | `True` |
| `PYTHON_VERSION` | `3.11.9` (pins a version compatible with `psycopg2-binary`) |

`SESSION_COOKIE_SAMESITE=None` and `SESSION_COOKIE_SECURE=True` are required because the frontend (`vercel.app`) and backend (`onrender.com`) are different domains — without them, the session cookie won't survive cross-site requests.

After the first deploy, run migrations against the live database (Render's free tier has no Shell access, so run this from a local machine using the database's **External** Database URL):
```bash
export DATABASE_URL="<external-url-from-render>"
export FLASK_APP=run.py
flask db upgrade
```

## API Used

**SeatGeek Platform API** — [platform.seatgeek.com](https://platform.seatgeek.com/)

Endpoints used:
- `GET /2/events?q={query}&client_id={id}` — search events by keyword
- `GET /2/events/{id}?client_id={id}` — get details for a single event
- `GET /2/events?sort=score.desc&per_page=10&client_id={id}` — fetch popular events for the homepage's hero background and "Popular right now" section

## Known Issues / Limitations

- Some SeatGeek events are missing performer images; these fall back to a placeholder icon
- No pagination yet on search results — SeatGeek's default result set (first page only) is shown
- No debouncing on search input; each submit triggers a fresh request
- Render's free tier spins down after inactivity — the first backend request after idle time can take 30–60 seconds

## Project Structure

```
src/
├── api/          # External API calls
│   ├── seatgeek.js   # SeatGeek search/details/featured events
│   └── backend.js    # Flask backend client (auth, collections, saved events)
├── components/   # Reusable UI (Navbar, EventCard, ListMenu, etc.)
├── context/      # Shared state via React Context
│   ├── AuthContext.jsx        # logged-in user, signup/login/logout
│   ├── FavoritesContext.jsx   # local favorites (Phase 1 behavior)
│   └── CollectionsContext.jsx # server-backed collections (Phase 2)
├── pages/        # Route-level views (Home, EventDetails, Favorites, Login, Signup)
└── App.jsx       # Root component, routing setup

backend/
├── app/
│   ├── auth/           # signup, login, logout, /auth/me
│   ├── collections/    # CRUD for user collections
│   ├── saved_events/   # CRUD for events saved within a collection
│   ├── models.py       # User, Collection, SavedEvent
│   └── config.py       # env-driven config (DB URL, CORS, cookies)
├── migrations/          # Alembic migration history
└── run.py              # entrypoint (`app` object used by gunicorn)
```

## Roadmap

- **Phase 2 (current):** Flask + PostgreSQL backend, user accounts, server-side collections — ✅ backend deployed, frontend wiring in progress
- **Phase 3:** Migrate `FavoritesContext` fully onto the backend so favorites persist per-user like collections do; add collection management UI (rename, delete, view saved events per collection)