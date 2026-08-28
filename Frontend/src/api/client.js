const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://find-cert-app-1.onrender.com"
).replace(/\/$/, "");

/**
 * Wrapper around fetch for talking to the FindCert Flask API.
 * Always sends cookies (credentials: "include") since auth is
 * session-based, and throws on non-2xx responses so callers can
 * just try/catch instead of checking res.ok everywhere.
 */
export async function apiRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty body, fine
  }

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}