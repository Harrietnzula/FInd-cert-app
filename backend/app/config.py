import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")

    # Render (and some other hosts) hand out "postgres://" URLs, but
    # SQLAlchemy 1.4+ requires "postgresql://". Normalize it here.
    database_url = os.environ.get("DATABASE_URL", "postgresql://localhost/findcert")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = database_url

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Comma-separated list of allowed frontend origins, e.g.
    # "http://localhost:3000,https://findcert.netlify.app"
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

    # Session cookie behavior. In local dev over http, keep these as-is.
    # In production (frontend + backend on different domains, over https),
    # set SESSION_COOKIE_SAMESITE=None and SESSION_COOKIE_SECURE=True.
    SESSION_COOKIE_SAMESITE = os.environ.get("SESSION_COOKIE_SAMESITE", "Lax")
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "False") == "True"

    # OAuth client ID from https://console.cloud.google.com/apis/credentials
    # (Web application type). Used to verify the ID token the frontend gets
    # back from Google Identity Services.
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

    # How many days out a saved event counts as an "upcoming" notification.
    NOTIFICATION_WINDOW_DAYS = int(os.environ.get("NOTIFICATION_WINDOW_DAYS", "14"))