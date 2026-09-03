const configuredBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://find-cert-app-1.onrender.com"
).replace(/\/+$/, "").replace(/\/api$/, "");
const productionBaseUrl = "https://find-cert-app-1.onrender.com";
const isDeployedFrontend = import.meta.env.PROD || (typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app"));
const BASE_URL = isDeployedFrontend && configuredBaseUrl.includes("localhost")
  ? productionBaseUrl
  : configuredBaseUrl;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  let response;
  const isFormData = options.body instanceof FormData;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The server is waking up. Please try logging in again in a moment.");
    }
    throw new Error("Unable to reach the login server. Please check your connection and try again.");
  } finally {
    clearTimeout(timeout);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body (e.g. some error pages) — leave data as null
  }

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

// --- Auth ---
export function signup({ username, email, password }) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function login({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function loginWithGoogle(credential) {
  return request("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function updateProfile(updates) {
  return request("/auth/profile", {
    method: "PATCH",
    body: updates,
  });
}

export function uploadProfileAvatar(file) {
  const body = new FormData();
  body.append("image", file);
  return request("/auth/profile/avatar", { method: "POST", body });
}

// --- Collections ---
export function fetchCollections({ page = 1, perPage = 10 } = {}) {
  return request(`/collections?page=${page}&per_page=${perPage}`);
}

export function createCollection({ name, description = "" }) {
  return request("/collections", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export function fetchCollection(collectionId) {
  return request(`/collections/${collectionId}`);
}

export function updateCollection(collectionId, updates) {
  return request(`/collections/${collectionId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteCollection(collectionId) {
  return request(`/collections/${collectionId}`, { method: "DELETE" });
}

// --- Community ---
export function fetchCommunityMessages(roomId) {
  return request(`/community/${encodeURIComponent(roomId)}/messages`);
}

export function sendCommunityMessage(roomId, body) {
  return request(`/community/${encodeURIComponent(roomId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

// --- Explore ---
export function fetchFollowedArtists() {
  return request("/explore/follows");
}

export function followArtist(artist) {
  return request("/explore/follows", {
    method: "POST",
    body: JSON.stringify(artist),
  });
}

export function unfollowArtist(artistId) {
  return request(`/explore/follows/${encodeURIComponent(artistId)}`, { method: "DELETE" });
}

export function searchUsers(query) {
  return request(`/explore/users?q=${encodeURIComponent(query)}`);
}

export function fetchDirectMessages(userId) {
  return request(`/explore/messages/${userId}`);
}

export function sendDirectMessage(userId, body) {
  return request(`/explore/messages/${userId}`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function fetchFollowing() {
  return request("/explore/following");
}

export function fetchFollowers() {
  return request("/explore/followers");
}

export function followUser(userId) {
  return request(`/explore/users/${userId}/follow`, { method: "POST" });
}

export function unfollowUser(userId) {
  return request(`/explore/users/${userId}/follow`, { method: "DELETE" });
}

// --- Saved Events ---
export function fetchSavedEvents(collectionId, { page = 1, perPage = 10 } = {}) {
  return request(
    `/collections/${collectionId}/events?page=${page}&per_page=${perPage}`
  );
}

export function addSavedEvent(collectionId, event) {
  return request(`/collections/${collectionId}/events`, {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export function updateSavedEvent(eventId, updates) {
  return request(`/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function removeSavedEvent(eventId) {
  return request(`/events/${eventId}`, { method: "DELETE" });
}

// --- Recents ---
export function fetchRecents({ limit = 20 } = {}) {
  return request(`/recents?limit=${limit}`);
}

export function recordRecent(event) {
  return request("/recents", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export function removeRecent(recentId) {
  return request(`/recents/${recentId}`, { method: "DELETE" });
}

// --- Notifications ---
export function fetchNotifications() {
  return request("/notifications");
}

export function dismissNotification(savedEventId) {
  return request(`/notifications/${savedEventId}/dismiss`, { method: "POST" });
}
