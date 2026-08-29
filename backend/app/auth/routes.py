from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from ..extensions import db
from ..models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400

    existing = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()
    if existing:
        return jsonify({"error": "username or email already in use"}), 409

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    login_user(user)
    return jsonify(user.to_dict()), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid email or password"}), 401

    login_user(user)
    return jsonify(user.to_dict()), 200


@auth_bp.route("/google", methods=["POST"])
def google_login():
    """Sign in (or sign up) using a Google Identity Services ID token.

    The frontend renders Google's official Sign in with Google button,
    which hands back a signed `credential` (an ID token) — we verify that
    token's signature server-side rather than trusting anything the client
    claims about who the user is.
    """
    data = request.get_json() or {}
    token = data.get("credential")
    if not token:
        return jsonify({"error": "credential is required"}), 400

    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    if not client_id:
        return jsonify({"error": "Google sign-in is not configured on this server"}), 500

    try:
        idinfo = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), client_id
        )
    except ValueError:
        return jsonify({"error": "invalid Google credential"}), 401

    google_id = idinfo["sub"]
    email = (idinfo.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Google account has no email"}), 400
    name = idinfo.get("name") or email.split("@")[0]
    avatar_url = idinfo.get("picture")

    user = User.query.filter_by(google_id=google_id).first()
    if user is None:
        # Link to an existing password account with the same email, if any.
        user = User.query.filter_by(email=email).first()
        if user is not None:
            user.google_id = google_id
            if avatar_url:
                user.avatar_url = avatar_url
        else:
            base_username = "".join(ch for ch in name if ch.isalnum()).lower() or "user"
            username = base_username
            suffix = 1
            while User.query.filter_by(username=username).first() is not None:
                suffix += 1
                username = f"{base_username}{suffix}"
            user = User(
                username=username,
                email=email,
                google_id=google_id,
                avatar_url=avatar_url,
            )
            db.session.add(user)

    db.session.commit()
    login_user(user)
    return jsonify(user.to_dict()), 200


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "logged out"}), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    if not current_user.is_authenticated:
        return jsonify({"error": "not authenticated"}), 401
    return jsonify(current_user.to_dict()), 200


@auth_bp.route("/profile", methods=["PATCH"])
@login_required
def update_profile():
    data = request.get_json() or {}
    if "avatar_url" in data:
        avatar_url = (data.get("avatar_url") or "").strip()
        if avatar_url and not avatar_url.startswith(("http://", "https://")):
            return jsonify({"error": "profile picture must be a valid image URL"}), 400
        if len(avatar_url) > 500:
            return jsonify({"error": "profile picture URL is too long"}), 400
        current_user.avatar_url = avatar_url or None

    db.session.commit()
    return jsonify(current_user.to_dict()), 200
