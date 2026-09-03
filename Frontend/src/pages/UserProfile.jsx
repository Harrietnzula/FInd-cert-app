import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchUserProfile, followUser, unfollowUser } from "../api/backend";
import { useAuth } from "../context/AuthContext";
import "./UserProfile.css";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("followers");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    fetchUserProfile(userId)
      .then(setProfile)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, userId]);

  async function handleFollow() {
    if (!profile || saving) return;
    setSaving(true);
    setError("");
    try {
      if (profile.user.is_following) {
        await unfollowUser(profile.user.id);
        setProfile((current) => ({
          ...current,
          user: {
            ...current.user,
            is_following: false,
            followers_count: Math.max(0, current.user.followers_count - 1),
          },
          followers: current.followers.filter((person) => person.id !== current.user.id),
        }));
      } else {
        await followUser(profile.user.id);
        setProfile((current) => ({
          ...current,
          user: {
            ...current.user,
            is_following: true,
            followers_count: current.user.followers_count + 1,
          },
        }));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) {
    return <div className="user-profile-page"><p className="status-message">Log in to view user profiles.</p><Link to="/login" className="user-profile-link">Log in</Link></div>;
  }

  if (loading) return <div className="user-profile-page"><p className="status-message">Loading profile...</p></div>;
  if (!profile) return <div className="user-profile-page"><p className="auth-error">{error || "User profile not found."}</p></div>;

  const people = tab === "followers" ? profile.followers : profile.following;
  return (
    <div className="user-profile-page">
      <Link to="/explore" className="back-link">← Back to Explore</Link>
      <section className="user-profile-card">
        <div className="user-profile-avatar">
          {profile.user.avatar_url ? <img src={profile.user.avatar_url} alt="" /> : profile.user.username.slice(0, 2).toUpperCase()}
        </div>
        <h1>{profile.user.username}</h1>
        <div className="user-profile-stats">
          <button type="button" className={tab === "followers" ? "active" : ""} onClick={() => setTab("followers")}><strong>{profile.user.followers_count}</strong> followers</button>
          <button type="button" className={tab === "following" ? "active" : ""} onClick={() => setTab("following")}><strong>{profile.user.following_count}</strong> following</button>
        </div>
        <div className="user-profile-actions">
          <button type="button" onClick={handleFollow} disabled={saving}>{profile.user.is_following ? "Following" : "Follow"}</button>
          <button type="button" onClick={() => navigate(`/messages?user=${profile.user.id}`)}>Message</button>
        </div>
      </section>
      <section className="user-profile-list">
        <h2>{tab === "followers" ? "Followers" : "Following"}</h2>
        {people.length === 0 ? <p className="status-message">No {tab} yet.</p> : people.map((person) => <Link className="user-profile-person" to={`/users/${person.id}`} key={person.id}><span className="user-profile-person-avatar">{person.avatar_url ? <img src={person.avatar_url} alt="" /> : person.username.slice(0, 2).toUpperCase()}</span><strong>{person.username}</strong></Link>)}
      </section>
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}

export default UserProfile;