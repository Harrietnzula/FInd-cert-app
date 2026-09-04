const configuredApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://find-cert-app-1.onrender.com"
).replace(/\/+$/, "").replace(/\/api$/, "");
const productionApiUrl = "https://find-cert-app-1.onrender.com";
const isDeployedFrontend = import.meta.env.PROD || (typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app"));
const API_URL = isDeployedFrontend && configuredApiUrl.includes("localhost")
  ? productionApiUrl
  : configuredApiUrl;

/**
 * Wrapper around fetch for talking to the Riffs Flask API.
 * Always sends cookies (credentials: "include") since auth is
 * session-based, and throws on non-2xx responses so callers can
 * just try/catch instead of checking res.ok everywhere.
 */
export async function apiRequest(path, { method = "GET", body } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The server is waking up. Please try again in a moment.");
    }
    throw new Error("Unable to reach the server. Please check your connection and try again.");
  } finally {
    clearTimeout(timeout);
  }

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