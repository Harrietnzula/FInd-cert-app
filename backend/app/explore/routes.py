from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from ..extensions import db
from ..models import ArtistFollow, DirectMessage, User

explore_bp = Blueprint("explore", __name__, url_prefix="/explore")


@explore_bp.route("/follows", methods=["GET"])
@login_required
def list_follows():
    follows = ArtistFollow.query.filter_by(user_id=current_user.id).order_by(
        ArtistFollow.created_at.desc()
    ).all()
    return jsonify({"follows": [follow.to_dict() for follow in follows]}), 200


@explore_bp.route("/follows", methods=["POST"])
@login_required
def follow_artist():
    data = request.get_json() or {}
    artist_id = str(data.get("artist_id") or "").strip()
    artist_name = (data.get("artist_name") or "").strip()
    if not artist_id or not artist_name:
        return jsonify({"error": "artist_id and artist_name are required"}), 400
    existing = ArtistFollow.query.filter_by(
        user_id=current_user.id, artist_id=artist_id
    ).first()
    if existing:
        return jsonify(existing.to_dict()), 200
    follow = ArtistFollow(
        user_id=current_user.id,
        artist_id=artist_id,
        artist_name=artist_name,
        image_url=(data.get("image_url") or "").strip() or None,
    )
    db.session.add(follow)
    db.session.commit()
    return jsonify(follow.to_dict()), 201


@explore_bp.route("/follows/<string:artist_id>", methods=["DELETE"])
@login_required
def unfollow_artist(artist_id):
    follow = ArtistFollow.query.filter_by(
        user_id=current_user.id, artist_id=artist_id
    ).first()
    if not follow:
        return jsonify({"error": "artist follow not found"}), 404
    db.session.delete(follow)
    db.session.commit()
    return jsonify({"message": "artist unfollowed"}), 200


@explore_bp.route("/users", methods=["GET"])
@login_required
def search_users():
    query = (request.args.get("q") or "").strip().lower()
    if len(query) < 2:
        return jsonify({"users": []}), 200
    users = User.query.filter(
        User.id != current_user.id,
        User.username.ilike(f"%{query}%"),
    ).order_by(User.username.asc()).limit(20).all()
    return jsonify({
        "users": [
            {"id": user.id, "username": user.username, "avatar_url": user.avatar_url}
            for user in users
        ]
    }), 200


def _conversation(user_id):
    return DirectMessage.query.filter(
        ((DirectMessage.sender_id == current_user.id) & (DirectMessage.recipient_id == user_id))
        | ((DirectMessage.sender_id == user_id) & (DirectMessage.recipient_id == current_user.id))
    ).order_by(DirectMessage.created_at.asc()).limit(100).all()


@explore_bp.route("/messages/<int:user_id>", methods=["GET"])
@login_required
def list_messages(user_id):
    user = db.session.get(User, user_id)
    if not user or user.id == current_user.id:
        return jsonify({"error": "user not found"}), 404
    return jsonify({"messages": [message.to_dict() for message in _conversation(user.id)]}), 200


@explore_bp.route("/messages/<int:user_id>", methods=["POST"])
@login_required
def send_message(user_id):
    user = db.session.get(User, user_id)
    if not user or user.id == current_user.id:
        return jsonify({"error": "user not found"}), 404
    body = ((request.get_json() or {}).get("body") or "").strip()
    if not body:
        return jsonify({"error": "message cannot be empty"}), 400
    if len(body) > 1000:
        return jsonify({"error": "message must be 1000 characters or fewer"}), 400
    message = DirectMessage(sender_id=current_user.id, recipient_id=user.id, body=body)
    db.session.add(message)
    db.session.commit()
    return jsonify(message.to_dict()), 201