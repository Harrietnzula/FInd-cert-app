import { useEffect, useState } from "react";
import { fetchEvents } from "../api/seatgeek";
import {
  fetchDirectMessages,
  fetchFollowers,
  fetchFollowedArtists,
  fetchFollowing,
  followUser,
  followArtist,
  searchUsers,
  sendDirectMessage,
  unfollowUser,
  unfollowArtist,
} from "../api/backend";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import "./Explore.css";

function Explore() {
  const { isAuthenticated, user } = useAuth();
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [artistLoading, setArtistLoading] = useState(false);
  const [artistError, setArtistError] = useState("");
  const [followedArtists, setFollowedArtists] = useState([]);
  const [followError, setFollowError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshRelationships().catch(() => {});
  }, [isAuthenticated]);

  async function refreshRelationships() {
    try {
      const [artists, followingData, followersData] = await Promise.all([
        fetchFollowedArtists(),
        fetchFollowing(),
        fetchFollowers(),
      ]);
      setFollowedArtists(artists.follows || []);
      setFollowing(followingData.users || []);
      setFollowers(followersData.users || []);
      return followingData.users || [];
    } catch (error) {
      setFollowError(error.message);
      throw error;
    }
  }

  async function handleArtistSearch(event) {
    event.preventDefault();
    const query = artistQuery.trim();
    if (!query) return;
    setArtistLoading(true);
    setArtistError("");
    try {
      const events = await fetchEvents(query);
      setArtistResults(events.filter((item) => item.performers?.length).slice(0, 12));
    } catch (error) {
      setArtistError(error.message || "Could not fetch artist performances.");
    } finally {
      setArtistLoading(false);
    }
  }

  async function handleFollow(artist) {
    if (!isAuthenticated) {
      setFollowError("Log in to follow artists and receive their upcoming dates.");
      return;
    }
    const performer = artist.performers[0];
    const artistId = String(performer.id || performer.name);
    const existing = followedArtists.some((item) => item.artist_id === artistId);
    setFollowError("");
    try {
      if (existing) {
        await unfollowArtist(artistId);
        setFollowedArtists((current) => current.filter((item) => item.artist_id !== artistId));
      } else {
        const follow = await followArtist({
          artist_id: artistId,
          artist_name: performer.name || artist.title,
          image_url: performer.image,
        });
        setFollowedArtists((current) => [...current, follow]);
      }
    } catch (error) {
      setFollowError(error.message || "Could not update that artist.");
    }
  }

  async function handleUserSearch(event) {
    event.preventDefault();
    const query = userQuery.trim();
    if (query.length < 2 || !isAuthenticated) return;
    setUserLoading(true);
    setMessageError("");
    try {
      const data = await searchUsers(query);
      setUserResults(data.users || []);
    } catch (error) {
      setMessageError(error.message);
    } finally {
      setUserLoading(false);
    }
  }

  async function handleUserFollow(person) {
    const isFollowing = person.is_following ?? following.some((item) => item.user_id === person.id);
    setMessageError("");
    try {
      if (isFollowing) {
        await unfollowUser(person.id);
        setFollowing((current) => current.filter((item) => item.user_id !== person.id));
      } else {
        await followUser(person.id);
        setFollowing((current) => [...current, { user_id: person.id, username: person.username, avatar_url: person.avatar_url }]);
      }
      await refreshRelationships();
      setUserResults((current) => current.map((item) => item.id === person.id ? {
        ...item,
        is_following: !isFollowing,
        followers_count: Math.max(0, (item.followers_count || 0) + (isFollowing ? -1 : 1)),
      } : item));
    } catch (error) {
      setMessageError(error.message);
    }
  }

  useEffect(() => {
    if (!activeUser) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    async function loadMessages() {
      setMessageLoading(true);
      try {
        const data = await fetchDirectMessages(activeUser.id);
        if (!cancelled) setMessages(data.messages || []);
      } catch (error) {
        if (!cancelled) setMessageError(error.message);
      } finally {
        if (!cancelled) setMessageLoading(false);
      }
    }
    setMessageError("");
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeUser]);

  async function handleSendMessage(event) {
    event.preventDefault();
    const body = messageBody.trim();
    if (!activeUser || !body || sending) return;
    setSending(true);
    setMessageError("");
    try {
      const message = await sendDirectMessage(activeUser.id, body);
      setMessages((current) => [...current, message]);
      setMessageBody("");
    } catch (error) {
      setMessageError(error.message);
    } finally {
      setSending(false);
    }
  }

  function isFollowed(event) {
    const performer = event.performers?.[0];
    const artistId = String(performer?.id || performer?.name || "");
    return followedArtists.some((item) => item.artist_id === artistId);
  }

  return (
    <div className="explore-page">
      <section className="explore-hero">
        <p className="explore-eyebrow">Explore the scene</p>
        <h1>Follow the artists<br /><span>you never stop playing.</span></h1>
        <p>Search an artist to see their next performance, follow their account, and find people who are listening too.</p>
      </section>

      <section className="explore-section">
        <div className="explore-section-heading">
          <div>
            <p className="explore-eyebrow">Artist accounts</p>
            <h2>Who is coming to town?</h2>
          </div>
          {isAuthenticated && <span className="explore-muted">{followedArtists.length} followed</span>}
        </div>
        <form className="explore-search" onSubmit={handleArtistSearch}>
          <input value={artistQuery} onChange={(event) => setArtistQuery(event.target.value)} placeholder="Search an artist, band, or tour" aria-label="Search artists" />
          <button type="submit" disabled={artistLoading || !artistQuery.trim()}>{artistLoading ? "Searching..." : "Search"}</button>
        </form>
        {artistError && <p className="explore-error">{artistError}</p>}
        {followError && <p className="explore-error">{followError}</p>}
        <div className="explore-results">
          {artistResults.map((event) => (
            <div className="explore-result" key={event.id}>
              <EventCard event={event} />
              <button type="button" className="explore-follow" onClick={() => handleFollow(event)}>
                {isFollowed(event) ? "Following artist" : "Follow artist"}
              </button>
            </div>
          ))}
        </div>
        {artistResults.length === 0 && !artistLoading && <p className="explore-empty">Search for an artist to see their upcoming performances.</p>}
      </section>

      <section className="explore-section explore-social">
        <div className="explore-section-heading">
          <div>
            <p className="explore-eyebrow">Find listeners</p>
            <h2>Talk to someone who gets it</h2>
          </div>
          {isAuthenticated && <span className="explore-muted">{followers.length} followers · {following.length} following</span>}
        </div>
        {!isAuthenticated ? (
          <p className="explore-empty">Log in to search for people and send direct messages.</p>
        ) : (
          <>
            <form className="explore-search" onSubmit={handleUserSearch}>
              <input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Search by username" aria-label="Search users" />
              <button type="submit" disabled={userLoading || userQuery.trim().length < 2}>{userLoading ? "Searching..." : "Find people"}</button>
            </form>
            <div className="user-results">
              {userResults.map((person) => (
                <div className={`user-result ${activeUser?.id === person.id ? "active" : ""}`} key={person.id}>
                  <span className="user-avatar">{person.avatar_url ? <img src={person.avatar_url} alt="" /> : person.username.slice(0, 2).toUpperCase()}</span>
                  <span>{person.username}</span>
                  <span className="user-result-stats">{person.followers_count || 0} followers · {person.following_count || 0} following</span>
                  <span className="user-result-action-wrap">
                    <button type="button" className="user-result-action" onClick={() => setActiveUser(person)}>Message</button>
                    <button type="button" className="user-follow-button" onClick={(event) => { event.stopPropagation(); handleUserFollow(person); }}>
                      {(person.is_following ?? following.some((item) => item.user_id === person.id)) ? "Following" : "Follow"}
                    </button>
                  </span>
                </div>
              ))}
            </div>
            {activeUser && (
              <div className="dm-panel">
                <div className="dm-heading"><strong>Chat with {activeUser.username}</strong><span>Signed in as {user?.username}</span></div>
                <div className="dm-messages" aria-live="polite">
                  {messageLoading ? <p className="explore-empty">Loading messages...</p> : messages.length === 0 ? <p className="explore-empty">Start the conversation about a show.</p> : messages.map((message) => <div className={`dm-message ${message.sender_id === user?.id ? "own" : ""}`} key={message.id}><strong>{message.sender}</strong><p>{message.body}</p></div>)}
                </div>
                <form className="dm-form" onSubmit={handleSendMessage}>
                  <input value={messageBody} onChange={(event) => setMessageBody(event.target.value)} maxLength={1000} placeholder="Write a message..." aria-label="Direct message" />
                  <button type="submit" disabled={sending || !messageBody.trim()}>{sending ? "Sending..." : "Send"}</button>
                </form>
                {messageError && <p className="explore-error">{messageError}</p>}
              </div>
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}

export default Explore;