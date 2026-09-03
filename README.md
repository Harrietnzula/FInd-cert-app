# FindCert

FindCert is a React and Flask application for discovering live events, saving favorites, organizing personal collections, and meeting people with similar concert interests.

## Live Application

- Frontend: https://f-ind-cert-app.vercel.app
- Backend API: https://find-cert-app-1.onrender.com

## Presentation

- [FindCert project presentation](https://docs.google.com/presentation/d/1JIkerWfvdbGCxBeNZYZn4WKnNetb5xUk8O7LGCyTzmg/edit?usp=sharing)

## Features

- SeatGeek event search and event details
- User signup and login with session-based authentication
- Server-backed favorites and named collections
- Discover community with interest circles and persistent room conversations
- Recently viewed events and upcoming notifications
- Profile picture URLs and collection avatars from saved event images
- Responsive mobile layout and shared event imagery

## Project Structure

- `Frontend/` - React and Vite frontend deployed on Vercel
- `backend/` - Flask, PostgreSQL, and Flask-Migrate API deployed on Render

Community messages are available to authenticated users in the Discover page. Messages are stored in PostgreSQL and grouped by concert-interest room.

## Documentation

- [Frontend setup and deployment](Frontend/README.md)
- [Backend setup and API reference](backend/BACKEND_README.md)

## Quick Start

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask --app run.py db upgrade
python run.py
```

The frontend runs at `http://localhost:5173` and the backend runs at `http://localhost:5555`.

### Deployment

The frontend deploys from the `main` branch on Vercel. The backend runs on Render and applies database migrations during startup. Production authentication requires `CORS_ORIGINS` to include the Vercel frontend URL, with `SESSION_COOKIE_SAMESITE=None` and `SESSION_COOKIE_SECURE=True`.
