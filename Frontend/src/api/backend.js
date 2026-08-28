const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5555";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body (e.g. some error pages) — leave data as null
  }

  if (!response.ok) {
    const message = data?.error || response.statusText || "Request failed";
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

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
  return request("/auth/me");
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
