from flask import Flask

from .config import Config
from .extensions import db, migrate, login_manager, bcrypt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(
        app,
        supports_credentials=True,
        origins=app.config.get("CORS_ORIGINS", "*"),
    )

    # Import models so Flask-Migrate can see them.
    from . import models  # noqa: F401

    from .auth.routes import auth_bp
    from .collections.routes import collections_bp
    from .saved_events.routes import saved_events_bp
    from .recents.routes import recents_bp
    from .notifications.routes import notifications_bp
    from .community.routes import community_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(collections_bp)
    app.register_blueprint(saved_events_bp)
    app.register_blueprint(recents_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(community_bp)

    @app.route("/")
    def index():
        return {"message": "FindCert API is running"}

    return app
