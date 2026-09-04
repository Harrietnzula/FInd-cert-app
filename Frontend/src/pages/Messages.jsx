import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchDirectMessages, fetchUserProfile, searchUsers, sendDirectMessage } from "../api/backend";
import { useAuth } from "../context/AuthContext";
import "./Messages.css";

function Messages() {
  const { isAuthenticated, user } = useAuth();
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const selectedId = params.get("user");
    if (!selectedId || !isAuthenticated) return;
    fetchUserProfile(selectedId)
      .then((result) => setActiveUser(result.user))
      .catch((requestError) => setError(requestError.message));
  }, [isAuthenticated, params]);

  async function handleSearch(event) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    setError("");
    try {
      const result = await searchUsers(query.trim());
      setPeople(result.users || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!activeUser) return undefined;
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchDirectMessages(activeUser.id);
        if (!cancelled) setMessages(result.messages || []);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeUser]);

  async function handleSend(event) {
    event.preventDefault();
    if (!activeUser || !body.trim() || sending) return;
    setSending(true);
    try {
      const message = await sendDirectMessage(activeUser.id, body.trim());
      setMessages((current) => [...current, message]);
      setBody("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  if (!isAuthenticated) return <div className="messages-page"><p className="status-message">Log in to use messages.</p><Link to="/login" className="user-profile-link">Log in</Link></div>;
  return (
    <div className="messages-page">
      <Link to="/explore" className="back-link">← Back to Explore</Link>
      <div className="messages-heading"><p className="explore-eyebrow">Private conversations</p><h1>Messages</h1><p>Search for a Riffs user and start a conversation about the next show.</p></div>
      <form className="messages-search" onSubmit={handleSearch}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by username" aria-label="Search users" /><button type="submit" disabled={loading || query.trim().length < 2}>{loading ? "Searching..." : "Find people"}</button></form>
      {error && <p className="explore-error">{error}</p>}
      <div className="messages-people">{people.map((person) => <button type="button" className={activeUser?.id === person.id ? "active" : ""} key={person.id} onClick={() => setActiveUser(person)}>{person.avatar_url ? <img src={person.avatar_url} alt="" /> : person.username.slice(0, 2).toUpperCase()}<span>{person.username}</span></button>)}</div>
      {activeUser && <section className="messages-panel"><div className="messages-panel-heading"><strong>{activeUser.username}</strong><Link to={`/users/${activeUser.id}`}>View profile</Link></div><div className="messages-list" aria-live="polite">{messages.length === 0 ? <p className="status-message">Start the conversation.</p> : messages.map((message) => <div className={`message-bubble ${message.sender_id === user?.id ? "own" : ""}`} key={message.id}><small>{message.sender}</small><p>{message.body}</p></div>)}</div><form className="messages-form" onSubmit={handleSend}><input value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} placeholder="Write a message..." aria-label="Message" /><button type="submit" disabled={sending || !body.trim()}>{sending ? "Sending..." : "Send"}</button></form></section>}
    </div>
  );
}

export default Messages;