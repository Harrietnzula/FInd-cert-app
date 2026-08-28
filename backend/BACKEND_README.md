# FindCert Backend (Flask + PostgreSQL)

## Tech stack
- Flask (app factory pattern, blueprints)
- Flask-SQLAlchemy (ORM)
- Flask-Migrate (Alembic migrations)
- Flask-Login (session-based auth)
- Flask-Bcrypt (password hashing)
- Flask-Cors (cross-origin requests from React, with credentials)
- PostgreSQL

## Data model
- **User** — has many Collections
- **Collection** — belongs to a User, has many SavedEvents
- **SavedEvent** — belongs to a Collection; stores a snapshot of a SeatGeek event

## Setup

1. Create and activate a virtualenv, then install dependencies:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Create a local Postgres database:
   ```bash
   createdb findcert
   ```

3. Copy `.env.example` to `.env` and fill in real values:
   ```bash
   cp .env.example .env
   ```

4. Initialize and run migrations:
   ```bash
   export FLASK_APP=run.py   # or `set` on Windows
   flask db init
   flask db migrate -m "initial tables"
   flask db upgrade
   ```

5. Run the server:
   ```bash
   python run.py
   ```
   The API runs at `http://localhost:5555`.

## Auth model
Session-based, via Flask-Login. On signup/login, a session cookie is set;
subsequent requests must include credentials (e.g. `fetch(url, { credentials: "include" })`
on the frontend). `@login_required` protects every route except `/auth/signup`,
`/auth/login`, and `/auth/me`. Every collection/event route also checks that the
resource belongs to `current_user` before allowing read/update/delete.

## API Endpoints

### Auth
| Method | Route           | Description                    |
|--------|-----------------|--------------------------------|
| POST   | /auth/signup    | Create account, logs in        |
| POST   | /auth/login     | Log in                         |
| POST   | /auth/logout    | Log out (requires login)       |
| GET    | /auth/me        | Get current logged-in user     |

### Collections
| Method | Route                    | Description                          |
|--------|--------------------------|---------------------------------------|
| GET    | /collections?page=&per_page= | List current user's collections (paginated) |
| POST   | /collections             | Create a collection                  |
| GET    | /collections/:id         | Get one collection + its events      |
| PATCH  | /collections/:id         | Update a collection                  |
| DELETE | /collections/:id         | Delete a collection                  |

### Saved Events
| Method | Route                                    | Description                     |
|--------|-------------------------------------------|----------------------------------|
| GET    | /collections/:id/events?page=&per_page=   | List events in a collection (paginated) |
| POST   | /collections/:id/events                   | Add an event to a collection     |
| PATCH  | /events/:id                               | Update a saved event             |
| DELETE | /events/:id                               | Remove a saved event             |

## Deploying (e.g. Render)
- Set env vars: `SECRET_KEY`, `DATABASE_URL` (Render Postgres), `CORS_ORIGINS`
  (your deployed frontend URL), `SESSION_COOKIE_SAMESITE=None`,
  `SESSION_COOKIE_SECURE=True`.
- Start command from the repository root: `sh backend/start.sh`
- If the Render Root Directory is `backend`, use: `sh start.sh`
