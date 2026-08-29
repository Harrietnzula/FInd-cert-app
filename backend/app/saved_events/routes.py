from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from ..extensions import db
from ..models import Collection, DismissedNotification, SavedEvent

saved_events_bp = Blueprint("saved_events", __name__)


def get_owned_collection_or_error(collection_id):
    collection = Collection.query.get(collection_id)
    if not collection:
        return None, (jsonify({"error": "collection not found"}), 404)
    if collection.user_id != current_user.id:
        return None, (jsonify({"error": "forbidden"}), 403)
    return collection, None


def get_owned_event_or_error(event_id):
    event = SavedEvent.query.get(event_id)
    if not event:
        return None, (jsonify({"error": "event not found"}), 404)
    if event.collection.user_id != current_user.id:
        return None, (jsonify({"error": "forbidden"}), 403)
    return event, None


@saved_events_bp.route("/collections/<int:collection_id>/events", methods=["GET"])
@login_required
def list_events(collection_id):
    collection, error = get_owned_collection_or_error(collection_id)
    if error:
        return error

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    pagination = SavedEvent.query.filter_by(collection_id=collection.id).order_by(
        SavedEvent.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "saved_events": [e.to_dict() for e in pagination.items],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }), 200


@saved_events_bp.route("/collections/<int:collection_id>/events", methods=["POST"])
@login_required
def create_event(collection_id):
    collection, error = get_owned_collection_or_error(collection_id)
    if error:
        return error

    data = request.get_json() or {}
    if not data.get("seatgeek_event_id") or not data.get("event_name"):
        return jsonify({"error": "seatgeek_event_id and event_name are required"}), 400

    event = SavedEvent(
        collection_id=collection.id,
        seatgeek_event_id=data["seatgeek_event_id"],
        event_name=data["event_name"],
        event_date=data.get("event_date"),
        venue_name=data.get("venue_name"),
        venue_city=data.get("venue_city"),
        event_url=data.get("event_url"),
        image_url=data.get("image_url"),
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


@saved_events_bp.route("/events/<int:event_id>", methods=["PATCH"])
@login_required
def update_event(event_id):
    event, error = get_owned_event_or_error(event_id)
    if error:
        return error

    data = request.get_json() or {}
    for field in (
        "event_name", "event_date", "venue_name",
        "venue_city", "event_url", "image_url",
    ):
        if field in data:
            setattr(event, field, data[field])

    db.session.commit()
    return jsonify(event.to_dict()), 200


@saved_events_bp.route("/events/<int:event_id>", methods=["DELETE"])
@login_required
def delete_event(event_id):
    event, error = get_owned_event_or_error(event_id)
    if error:
        return error

    DismissedNotification.query.filter_by(saved_event_id=event.id).delete(
        synchronize_session=False
    )
    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "event deleted"}), 200
