import os

import requests
from flask import Blueprint, jsonify, request


events_bp = Blueprint("events", __name__, url_prefix="/events")
EVENTBRITE_SEARCH_URL = "https://www.eventbriteapi.com/v3/events/search/"


def normalize_event(event):
    venue = event.get("venue") or {}
    address = venue.get("address") or {}
    image = event.get("logo") or {}
    return {
        "id": f"eventbrite-{event['id']}",
        "title": event.get("name", {}).get("text", "Untitled event"),
        "datetime_local": (event.get("start") or {}).get("local"),
        "url": event.get("url"),
        "venue": {
            "name": venue.get("name"),
            "city": address.get("city"),
            "address": address.get("localized_address_display"),
            "state": address.get("region"),
        },
        "performers": [{"image": image.get("original", {}).get("url")}],
        "type": "event",
    }


@events_bp.route("/kenya", methods=["GET"])
def kenya_events():
    token = os.environ.get("EVENTBRITE_TOKEN")
    if not token:
        return jsonify({"error": "Kenya events are not configured yet"}), 503

    city = request.args.get("city", "").strip()
    params = {
        "location.address": city or "Kenya",
        "expand": "venue",
        "status": "live",
        "order_by": "start_date",
        "page_size": request.args.get("per_page", 24, type=int),
    }
    try:
        response = requests.get(
            EVENTBRITE_SEARCH_URL,
            params=params,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException:
        return jsonify({"error": "Kenya events are temporarily unavailable"}), 502

    return jsonify({"events": [normalize_event(event) for event in response.json().get("events", [])]})