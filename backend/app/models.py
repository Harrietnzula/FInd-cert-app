from datetime import datetime

from flask_login import UserMixin

from .extensions import db, bcrypt, login_manager


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Nullable because Google-authenticated users have no local password.
    password_hash = db.Column(db.String(128), nullable=True)
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    avatar_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    collections = db.relationship(
        "Collection",
        backref="owner",
        cascade="all, delete-orphan",
        lazy=True,
    )
    community_messages = db.relationship(
        "CommunityMessage",
        backref="author",
        cascade="all, delete-orphan",
        lazy=True,
    )
    sent_messages = db.relationship(
        "DirectMessage",
        foreign_keys="DirectMessage.sender_id",
        backref="sender",
        cascade="all, delete-orphan",
        lazy=True,
    )
    received_messages = db.relationship(
        "DirectMessage",
        foreign_keys="DirectMessage.recipient_id",
        backref="recipient",
        cascade="all, delete-orphan",
        lazy=True,
    )
    artist_follows = db.relationship(
        "ArtistFollow",
        backref="user",
        cascade="all, delete-orphan",
        lazy=True,
    )
    following = db.relationship(
        "UserFollow",
        foreign_keys="UserFollow.follower_id",
        backref="follower",
        cascade="all, delete-orphan",
        lazy=True,
    )
    followers = db.relationship(
        "UserFollow",
        foreign_keys="UserFollow.followed_id",
        backref="followed",
        cascade="all, delete-orphan",
        lazy=True,
    )
    recent_events = db.relationship(
        "RecentEvent",
        backref="user",
        cascade="all, delete-orphan",
        lazy=True,
    )
    dismissed_notifications = db.relationship(
        "DismissedNotification",
        backref="user",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "avatar_url": self.avatar_url,
            "auth_provider": "google" if self.google_id else "password",
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


class CommunityMessage(db.Model):
    __tablename__ = "community_messages"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(80), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "room_id": self.room_id,
            "body": self.body,
            "author": self.author.username,
            "author_id": self.user_id,
            "created_at": self.created_at.isoformat(),
        }


class ArtistFollow(db.Model):
    __tablename__ = "artist_follows"
    __table_args__ = (
        db.UniqueConstraint("user_id", "artist_id", name="uq_user_artist_follow"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    artist_id = db.Column(db.String(120), nullable=False)
    artist_name = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "artist_id": self.artist_id,
            "artist_name": self.artist_name,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat(),
        }


class UserFollow(db.Model):
    __tablename__ = "user_follows"
    __table_args__ = (
        db.UniqueConstraint("follower_id", "followed_id", name="uq_user_follow"),
    )

    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.followed_id,
            "username": self.followed.username,
            "avatar_url": self.followed.avatar_url,
            "created_at": self.created_at.isoformat(),
        }


class DirectMessage(db.Model):
    __tablename__ = "direct_messages"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
            "body": self.body,
            "sender": self.sender.username,
            "recipient": self.recipient.username,
            "created_at": self.created_at.isoformat(),
        }


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


class RecentEvent(db.Model):
    """An event a user recently viewed (SeatGeek search result), for the
    Profile > Recents tab. One row per (user, event); re-viewing an event
    just bumps its viewed_at instead of duplicating rows.
    """

    __tablename__ = "recent_events"
    __table_args__ = (
        db.UniqueConstraint("user_id", "seatgeek_event_id", name="uq_user_recent_event"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    seatgeek_event_id = db.Column(db.String(50), nullable=False)
    event_name = db.Column(db.String(200), nullable=False)
    event_date = db.Column(db.String(50))
    venue_name = db.Column(db.String(200))
    venue_city = db.Column(db.String(100))
    event_url = db.Column(db.String(500))
    image_url = db.Column(db.String(500))
    performer_name = db.Column(db.String(200))

    viewed_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "seatgeek_event_id": self.seatgeek_event_id,
            "event_name": self.event_name,
            "event_date": self.event_date,
            "venue_name": self.venue_name,
            "venue_city": self.venue_city,
            "event_url": self.event_url,
            "image_url": self.image_url,
            "performer_name": self.performer_name,
            "viewed_at": self.viewed_at.isoformat(),
        }


class DismissedNotification(db.Model):
    """Tracks which upcoming-event notifications a user has cleared, so
    dismissed reminders don't keep reappearing. Notifications themselves are
    computed on the fly from the user's saved events (see notifications
    blueprint) rather than stored.
    """

    __tablename__ = "dismissed_notifications"
    __table_args__ = (
        db.UniqueConstraint("user_id", "saved_event_id", name="uq_user_dismissed_event"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    saved_event_id = db.Column(db.Integer, db.ForeignKey("saved_events.id"), nullable=False)
    dismissed_at = db.Column(db.DateTime, default=datetime.utcnow)
