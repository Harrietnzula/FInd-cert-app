from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from ..extensions import db
from ..models import CommunityMessage

community_bp = Blueprint("community", __name__, url_prefix="/community")


@community_bp.route("/<string:room_id>/messages", methods=["GET"])
@login_required
def list_messages(room_id):
    messages = (
        CommunityMessage.query.filter_by(room_id=room_id)
        .order_by(CommunityMessage.created_at.desc())
        .limit(100)
        .all()
    )
    return jsonify({"messages": [message.to_dict() for message in reversed(messages)]}), 200


@community_bp.route("/<string:room_id>/messages", methods=["POST"])
@login_required
def create_message(room_id):
    data = request.get_json() or {}
    body = (data.get("body") or "").strip()
    if not body:
        return jsonify({"error": "message cannot be empty"}), 400
    if len(body) > 500:
        return jsonify({"error": "message must be 500 characters or fewer"}), 400

    message = CommunityMessage(room_id=room_id, user_id=current_user.id, body=body)
    db.session.add(message)
    db.session.commit()
    return jsonify(message.to_dict()), 201