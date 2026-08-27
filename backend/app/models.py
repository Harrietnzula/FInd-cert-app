from datetime import datetime

from flask_login import UserMixin

from .extensions import db, bcrypt, login_manager


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    collections = db.relationship(
        "Collection",
        backref="owner",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class Collection(db.Model):
    __tablename__ = "collections"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    saved_events = db.relationship(
        "SavedEvent",
        backref="collection",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def to_dict(self, include_events=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "event_count": len(self.saved_events),
        }
        if include_events:
            data["saved_events"] = [e.to_dict() for e in self.saved_events]
        return data


class SavedEvent(db.Model):
    __tablename__ = "saved_events"

    id = db.Column(db.Integer, primary_key=True)
    collection_id = db.Column(db.Integer, db.ForeignKey("collections.id"), nullable=False)

    # Data copied from a SeatGeek search result at the time it was saved.
    seatgeek_event_id = db.Column(db.String(50), nullable=False)
    event_name = db.Column(db.String(200), nullable=False)
    event_date = db.Column(db.String(50))
    venue_name = db.Column(db.String(200))
    venue_city = db.Column(db.String(100))
    event_url = db.Column(db.String(500))
    image_url = db.Column(db.String(500))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "collection_id": self.collection_id,
            "seatgeek_event_id": self.seatgeek_event_id,
            "event_name": self.event_name,
            "event_date": self.event_date,
            "venue_name": self.venue_name,
            "venue_city": self.venue_city,
            "event_url": self.event_url,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat(),
        }
