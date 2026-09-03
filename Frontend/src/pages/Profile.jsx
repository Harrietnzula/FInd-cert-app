import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCollections } from "../context/CollectionsContext";
import * as api from "../api/backend";
import SavedEventCard from "../components/SavedEventCard";
import "./Profile.css";

function initials(name) {
  return (name || "?").slice(0, 2).toUpperCase();
}

function Profile() {
  const { user, isAuthenticated } = useAuth();
  const {
    collections,
    loading: collectionsLoading,
    createCollection,
    deleteCollection,
    removeFromCollection,
  } = useCollections();

  const [tab, setTab] = useState("collections"); // "collections" | "recents"
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [collectionError, setCollectionError] = useState("");

  const [recents, setRecents] = useState([]);
  const [recentsLoading, setRecentsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarReading, setAvatarReading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    setAvatarUrl(user?.avatar_url || "");
  }, [user?.avatar_url]);

  useEffect(() => {
    if (!isAuthenticated || tab !== "recents") return;
    setRecentsLoading(true);
    api
      .fetchRecents()
      .then((data) => setRecents(data.recents))
      .catch(() => setRecents([]))
      .finally(() => setRecentsLoading(false));
  }, [isAuthenticated, tab]);

  const filteredCollections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return collections;
    return collections.filter((c) => c.name.toLowerCase().includes(term));
  }, [collections, search]);

  const selectedCollection = collections.find((c) => c.id === selectedId);

  async function handleCreate(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setCollectionError("");
    try {
      await createCollection(name);
      setNewName("");
      setShowCreate(false);
    } catch (err) {
      setCollectionError(err.message || "Could not create this collection. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteCollection(id) {
    if (!window.confirm("Delete this collection and everything saved in it?")) return;
    setDeletingId(id);
    setCollectionError("");
    try {
      await deleteCollection(id);
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      setCollectionError(err.message || "Could not delete this collection. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRemoveEvent(collectionId, event) {
    await removeFromCollection(collectionId, event.seatgeek_event_id);
  }

  async function handleRemoveRecent(recent) {
    await api.removeRecent(recent.id);
    setRecents((prev) => prev.filter((r) => r.id !== recent.id));
  }

  async function handleAvatarSave(e) {
    e.preventDefault();
    setAvatarSaving(true);
    setAvatarError("");
    try {
      const updated = avatarFile
        ? await api.uploadProfileAvatar(avatarFile)
        : await api.updateProfile({ avatar_url: avatarUrl });
      window.dispatchEvent(new CustomEvent("findcert:user-updated", { detail: updated }));
      setEditingAvatar(false);
    } catch (err) {
      setAvatarError(err.message || "Could not save your picture. Please try again.");
    } finally {
      setAvatarSaving(false);
    }
  }

  function handleAvatarFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
      setAvatarError("Please choose a JPEG or another image file.");
      e.target.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarError("Please choose an image smaller than 8 MB.");
      e.target.value = "";
      return;
    }

    setAvatarReading(true);
    setAvatarError("");
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const size = 320;
        const scale = Math.min(1, size / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          setAvatarError("Your browser could not prepare that image.");
          setAvatarReading(false);
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setAvatarUrl(canvas.toDataURL("image/jpeg", 0.82));
        setAvatarFile(file);
        setAvatarReading(false);
      };
      image.onerror = () => {
        setAvatarError("That image could not be read. Please choose another file.");
        setAvatarReading(false);
      };
      image.src = reader.result;
    };
    reader.onerror = () => {
      setAvatarError("That image could not be read. Please choose another file.");
      setAvatarReading(false);
    };
    reader.readAsDataURL(file);
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="profile-empty-state">
          <p className="profile-empty-icon">◐</p>
          <p className="status-message">Log in to see your profile, recents, and collections.</p>
          <Link to="/login" className="empty-favorites-link">
            Log in →
          </Link>
        </div>
        {collectionError && <p className="auth-error">{collectionError}</p>}
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-avatar">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" />
          ) : (
            <span>{initials(user?.username)}</span>
          )}
        </div>
        <div>
          <h1>{user?.username}</h1>
          <p className="profile-subtext">{user?.email}</p>
        </div>
        <button
          className="profile-avatar-edit"
          onClick={() => setEditingAvatar((open) => !open)}
        >
          {editingAvatar ? "Cancel" : "Change picture"}
        </button>
      </header>

      {editingAvatar && (
        <form className="profile-avatar-form" onSubmit={handleAvatarSave}>
          <label htmlFor="avatar-file">Choose a picture from your computer</label>
          <input
            id="avatar-file"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAvatarFileChange}
            disabled={avatarReading || avatarSaving}
          />
          {avatarReading && <p className="profile-avatar-help">Preparing your picture...</p>}
          <label htmlFor="avatar-url">Profile picture URL</label>
          <div className="profile-avatar-form-row">
            <input
              id="avatar-url"
              type="url"
              placeholder="https://example.com/your-picture.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <button type="submit" disabled={avatarSaving || avatarReading || !avatarUrl.trim()}>
              {avatarSaving ? "Saving..." : "Save"}
            </button>
          </div>
          {avatarError && <p className="auth-error">{avatarError}</p>}
        </form>
      )}

      <div className="profile-tabs">
        <button
          className={tab === "collections" ? "active" : ""}
          onClick={() => setTab("collections")}
        >
          Collections
        </button>
        <button
          className={tab === "recents" ? "active" : ""}
          onClick={() => setTab("recents")}
        >
          Recents
        </button>
      </div>

      {tab === "collections" && !selectedCollection && (
        <>
          <div className="profile-toolbar">
            <input
              type="search"
              placeholder="Search your collections"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="profile-search"
            />
            <button
              className="profile-create-btn"
              onClick={() => setShowCreate((s) => !s)}
              aria-label="Create collection"
              title="Create collection"
            >
              +
            </button>
          </div>

          {showCreate && (
            <form className="profile-create-form" onSubmit={handleCreate}>
              <input
                type="text"
                autoFocus
                placeholder="Collection name — e.g. Bucket List, This Weekend, Beyoncé"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button type="submit" disabled={creating || !newName.trim()}>
                {creating ? "Creating…" : "Create"}
              </button>
            </form>
          )}

          {collectionsLoading ? (
            <p className="status-message">Loading your collections…</p>
          ) : filteredCollections.length === 0 ? (
            <div className="profile-empty-state">
              <p className="profile-empty-icon">☰</p>
              <p className="status-message">
                {search
                  ? "No collections match your search."
                  : "No collections yet — make one for a bucket list, this weekend, or a favorite artist."}
              </p>
            </div>
          ) : (
            <ul className="profile-collections-list">
              {filteredCollections.map((c) => (
                <li key={c.id}>
                  <button
                    className="profile-collection-row"
                    onClick={() => setSelectedId(c.id)}
                  >
                    <span className="profile-collection-icon">
                      {c.saved_events?.[0]?.image_url ? (
                        <img
                          src={c.saved_events[0].image_url}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        "▤"
                      )}
                    </span>
                    <span className="profile-collection-info">
                      <span className="profile-collection-name">{c.name}</span>
                      <span className="profile-collection-count">
                        {c.event_count} {c.event_count === 1 ? "event" : "events"}
                      </span>
                    </span>
                  </button>
                  <button
                    className="profile-collection-delete"
                    onClick={() => handleDeleteCollection(c.id)}
                    disabled={deletingId === c.id}
                    aria-label={`Delete ${c.name}`}
                    title="Delete collection"
                  >
                    {deletingId === c.id ? "…" : "×"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === "collections" && selectedCollection && (
        <div className="profile-collection-detail">
          <button className="back-link" onClick={() => setSelectedId(null)}>
            ← All collections
          </button>
          <h2>{selectedCollection.name}</h2>
          {(selectedCollection.saved_events || []).length === 0 ? (
            <p className="status-message">
              Nothing saved here yet. Add events from their details page.
            </p>
          ) : (
            <div className="profile-events-grid">
              {selectedCollection.saved_events.map((event) => (
                <SavedEventCard
                  key={event.id}
                  event={event}
                  onRemove={() => handleRemoveEvent(selectedCollection.id, event)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "recents" && (
        <>
          {recentsLoading ? (
            <p className="status-message">Loading recents…</p>
          ) : recents.length === 0 ? (
            <div className="profile-empty-state">
              <p className="profile-empty-icon">◷</p>
              <p className="status-message">Events you view will show up here.</p>
            </div>
          ) : (
            <div className="profile-events-grid">
              {recents.map((event) => (
                <SavedEventCard
                  key={event.id}
                  event={event}
                  onRemove={handleRemoveRecent}
                  removeLabel="Remove from recents"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Profile;
