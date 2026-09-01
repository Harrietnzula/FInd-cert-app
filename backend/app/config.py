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

    # Comma-separated list of allowed frontend origins. Default to the Vercel
    # production domain while still allowing local development origins.
    default_cors_origins = (
        "https://f-ind-cert-app.vercel.app,"
        "http://localhost:5173,"
        "http://localhost:3000"
    )
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.environ.get("CORS_ORIGINS", default_cors_origins).split(",")
        if origin.strip()
    ]

    # Production auth requires cookies to be allowed across subdomains.
    # Vercel and Render are different origins, so the session cookie must be
    # cross-site compatible. Local development usually remains Lax/False.
    default_same_site = "None" if any("vercel.app" in origin for origin in CORS_ORIGINS) else "Lax"
    SESSION_COOKIE_SAMESITE = os.environ.get("SESSION_COOKIE_SAMESITE", default_same_site)
    default_secure = "True" if any("vercel.app" in origin for origin in CORS_ORIGINS) else "False"
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", default_secure) == "True"

    # OAuth client ID from https://console.cloud.google.com/apis/credentials
    # (Web application type). Used to verify the ID token the frontend gets
    # back from Google Identity Services.
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

    # How many days out a saved event counts as an "upcoming" notification.
    NOTIFICATION_WINDOW_DAYS = int(os.environ.get("NOTIFICATION_WINDOW_DAYS", "14"))