from datetime import datetime, timedelta

from flask import Blueprint, jsonify, current_app
from flask_login import login_required, current_user

from ..extensions import db
from ..models import Collection, SavedEvent, DismissedNotification

notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")


def _parse_event_date(raw):
    """SeatGeek dates look like '2026-09-08T19:00:00'. Be lenient about
    the exact format so a saved event we can't parse just gets skipped
    rather than crashing the endpoint.
    """
    if not raw:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(raw[:19] if "T" in raw else raw, fmt)
        except ValueError:
            continue
    return None


@notifications_bp.route("", methods=["GET"])
@login_required
def list_notifications():
    """Saved events (across every collection the user owns) happening
    within NOTIFICATION_WINDOW_DAYS, excluding ones they've dismissed.
    This doubles as the 'favorite artist/concert coming up' reminder,
    since a user's saved events are effectively their followed shows.
    """
    window_days = current_app.config.get("NOTIFICATION_WINDOW_DAYS", 14)
    now = datetime.utcnow()
    horizon = now + timedelta(days=window_days)

    dismissed_ids = {
        d.saved_event_id
        for d in DismissedNotification.query.filter_by(user_id=current_user.id).all()
    }

    saved_events = (
        SavedEvent.query.join(Collection)
        .filter(Collection.user_id == current_user.id)
        .all()
    )

    upcoming = []
    for event in saved_events:
        if event.id in dismissed_ids:
            continue
        event_dt = _parse_event_date(event.event_date)
        if event_dt is None or not (now <= event_dt <= horizon):
            continue
        payload = event.to_dict()
        payload["days_until"] = (event_dt - now).days
        upcoming.append(payload)

    upcoming.sort(key=lambda e: e["days_until"])
    return jsonify({"notifications": upcoming, "window_days": window_days}), 200


@notifications_bp.route("/<int:saved_event_id>/dismiss", methods=["POST"])
@login_required
def dismiss_notification(saved_event_id):
    event = (
        SavedEvent.query.join(Collection)
        .filter(SavedEvent.id == saved_event_id, Collection.user_id == current_user.id)
        .first()
    )
    if not event:
        return jsonify({"error": "not found"}), 404

    existing = DismissedNotification.query.filter_by(
        user_id=current_user.id, saved_event_id=saved_event_id
    ).first()
    if not existing:
        db.session.add(
            DismissedNotification(user_id=current_user.id, saved_event_id=saved_event_id)
        )
        db.session.commit()

    return jsonify({"message": "dismissed"}), 200
