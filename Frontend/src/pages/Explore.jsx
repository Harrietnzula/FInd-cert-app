import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchEvents } from "../api/seatgeek";
import {
  fetchFollowedArtists,
  followArtist,
  searchUsers,
  unfollowArtist,
} from "../api/backend";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import "./Explore.css";

function Explore() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [artistLoading, setArtistLoading] = useState(false);
  const [artistError, setArtistError] = useState("");
  const [followedArtists, setFollowedArtists] = useState([]);
  const [followError, setFollowError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFollowedArtists()
      .then((artists) => setFollowedArtists(artists.follows || []))
      .catch((error) => setFollowError(error.message));
  }, [isAuthenticated]);

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
    try {
      const data = await searchUsers(query);
      setUserResults(data.users || []);
    } catch (error) {
      setFollowError(error.message);
    } finally {
      setUserLoading(false);
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
          {isAuthenticated && <span className="explore-muted">Open a profile to follow people</span>}
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
                <div
                  className="user-result"
                  key={person.id}
                  onClick={() => navigate(`/users/${person.id}`)}
                  onKeyDown={(event) => { if (event.key === "Enter") navigate(`/users/${person.id}`); }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="user-avatar">{person.avatar_url ? <img src={person.avatar_url} alt="" /> : person.username.slice(0, 2).toUpperCase()}</span>
                  <span>{person.username}</span>
                  <span className="user-result-stats">{person.followers_count || 0} followers · {person.following_count || 0} following</span>
                  <span className="user-result-action">View profile</span>
                </div>
              ))}
            </div>
            <p className="explore-empty">Select a person to view their profile, followers, and following.</p>
            <Link className="explore-messages-link" to="/messages">Open Messages</Link>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}

export default Explore;