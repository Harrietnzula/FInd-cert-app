import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as api from "../api/backend";
import "./NotificationBell.css";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  function loadNotifications() {
    api
      .fetchNotifications()
      .then((data) => setNotifications(data.notifications))
      .catch(() => setNotifications([]));
  }

  useEffect(() => {
    loadNotifications();
    // Refresh periodically so a reminder disappears elsewhere (e.g.
    // dismissed in another tab) without requiring a full page reload.
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleDismiss(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.dismissNotification(id);
    } catch {
      loadNotifications();
    }
  }

  return (
    <div className="notification-bell" ref={ref}>
      <button
        className="notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        🔔
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown" role="dialog" aria-label="Notifications">
          <h4>Upcoming</h4>
          {notifications.length === 0 ? (
            <p className="notification-empty">Nothing coming up in the next two weeks.</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link to={`/event/${n.seatgeek_event_id}`} onClick={() => setOpen(false)}>
                    <span className="notification-event-name">{n.event_name}</span>
                    <span className="notification-event-meta">
                      {n.days_until === 0 ? "Today" : `In ${n.days_until} day${n.days_until === 1 ? "" : "s"}`}
                      {n.venue_city ? ` · ${n.venue_city}` : ""}
                    </span>
                  </Link>
                  <button
                    className="notification-dismiss"
                    onClick={() => handleDismiss(n.id)}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
