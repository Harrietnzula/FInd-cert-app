from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from ..extensions import db
from ..models import RecentEvent

recents_bp = Blueprint("recents", __name__, url_prefix="/recents")

MAX_RECENTS = 30


@recents_bp.route("", methods=["GET"])
@login_required
def list_recents():
    limit = min(request.args.get("limit", 20, type=int), MAX_RECENTS)
    recents = (
        RecentEvent.query.filter_by(user_id=current_user.id)
        .order_by(RecentEvent.viewed_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify({"recents": [r.to_dict() for r in recents]}), 200


@recents_bp.route("", methods=["POST"])
@login_required
def record_recent():
    """Upsert a 'recently viewed' entry. Called when a user opens an
    event's details page. Re-viewing an event just bumps viewed_at rather
    than creating duplicate rows.
    """
    data = request.get_json() or {}
    seatgeek_event_id = str(data.get("seatgeek_event_id") or "").strip()
    event_name = (data.get("event_name") or "").strip()
    if not seatgeek_event_id or not event_name:
        return jsonify({"error": "seatgeek_event_id and event_name are required"}), 400

    recent = RecentEvent.query.filter_by(
        user_id=current_user.id, seatgeek_event_id=seatgeek_event_id
    ).first()

    fields = {
        "event_name": event_name,
        "event_date": data.get("event_date"),
        "venue_name": data.get("venue_name"),
        "venue_city": data.get("venue_city"),
        "event_url": data.get("event_url"),
        "image_url": data.get("image_url"),
        "performer_name": data.get("performer_name"),
    }

    if recent is None:
        recent = RecentEvent(
            user_id=current_user.id,
            seatgeek_event_id=seatgeek_event_id,
            **fields,
        )
        db.session.add(recent)
    else:
        for key, value in fields.items():
            setattr(recent, key, value)
        recent.viewed_at = datetime.utcnow()

    db.session.commit()

    # Keep only the most recent MAX_RECENTS rows per user.
    overflow = (
        RecentEvent.query.filter_by(user_id=current_user.id)
        .order_by(RecentEvent.viewed_at.desc())
        .offset(MAX_RECENTS)
        .all()
    )
    for row in overflow:
        db.session.delete(row)
    if overflow:
        db.session.commit()

    return jsonify(recent.to_dict()), 200


@recents_bp.route("/<int:recent_id>", methods=["DELETE"])
@login_required
def delete_recent(recent_id):
    recent = RecentEvent.query.get(recent_id)
    if not recent:
        return jsonify({"error": "not found"}), 404
    if recent.user_id != current_user.id:
        return jsonify({"error": "forbidden"}), 403

    db.session.delete(recent)
    db.session.commit()
    return jsonify({"message": "removed"}), 200
