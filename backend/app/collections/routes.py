from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from ..extensions import db
from ..models import Collection, DismissedNotification, SavedEvent

collections_bp = Blueprint("collections", __name__, url_prefix="/collections")


def get_owned_collection_or_error(collection_id):
    """Returns (collection, None) or (None, (response, status))."""
    collection = Collection.query.get(collection_id)
    if not collection:
        return None, (jsonify({"error": "collection not found"}), 404)
    if collection.user_id != current_user.id:
        return None, (jsonify({"error": "forbidden"}), 403)
    return collection, None


@collections_bp.route("", methods=["GET"])
@login_required
def list_collections():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    pagination = Collection.query.filter_by(user_id=current_user.id).order_by(
        Collection.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "collections": [c.to_dict() for c in pagination.items],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }), 200


@collections_bp.route("", methods=["POST"])
@login_required
def create_collection():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    collection = Collection(
        name=name,
        description=data.get("description", ""),
        user_id=current_user.id,
    )
    db.session.add(collection)
    db.session.commit()
    return jsonify(collection.to_dict()), 201


@collections_bp.route("/<int:collection_id>", methods=["GET"])
@login_required
def get_collection(collection_id):
    collection, error = get_owned_collection_or_error(collection_id)
    if error:
        return error
    return jsonify(collection.to_dict(include_events=True)), 200


@collections_bp.route("/<int:collection_id>", methods=["PATCH"])
@login_required
def update_collection(collection_id):
    collection, error = get_owned_collection_or_error(collection_id)
    if error:
        return error

    data = request.get_json() or {}
    if "name" in data:
        name = (data["name"] or "").strip()
        if not name:
            return jsonify({"error": "name cannot be empty"}), 400
        collection.name = name
    if "description" in data:
        collection.description = data["description"]

    db.session.commit()
    return jsonify(collection.to_dict()), 200


@collections_bp.route("/<int:collection_id>", methods=["DELETE"])
@login_required
def delete_collection(collection_id):
    collection, error = get_owned_collection_or_error(collection_id)
    if error:
        return error

    saved_event_ids = [event.id for event in collection.saved_events]
    if saved_event_ids:
        DismissedNotification.query.filter(
            DismissedNotification.saved_event_id.in_(saved_event_ids)
        ).delete(synchronize_session=False)
        SavedEvent.query.filter(SavedEvent.id.in_(saved_event_ids)).delete(
            synchronize_session=False
        )
    db.session.delete(collection)
    db.session.commit()
    return jsonify({"message": "collection deleted"}), 200
