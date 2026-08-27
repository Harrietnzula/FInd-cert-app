import os


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
