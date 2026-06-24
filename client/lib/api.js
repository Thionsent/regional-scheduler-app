import { Platform } from "react-native";

// Override with EXPO_PUBLIC_API_URL for a physical device or deployed API.
// 10.0.2.2 routes Android-emulator traffic back to the host machine.
const API_URL = process.env.EXPO_PUBLIC_API_URL || (
  Platform.OS === "web" ? "http://localhost:4000" : "http://10.0.2.2:4000"
);
let token = null;

export function setAccessToken(nextToken) { token = nextToken; }
export function getAccessToken() { return token; }

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Cannot reach the Scheduler API at ${API_URL}. Start the backend and verify EXPO_PUBLIC_API_URL.`);
  }
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "REQUEST_FAILED");
  return body.data ?? body;
}

export const api = {
  auth: {
    register: (input) => request("/v1/auth/register", { method: "POST", body: JSON.stringify(input) }),
    login: (input) => request("/v1/auth/login", { method: "POST", body: JSON.stringify(input) }),
    refresh: (input) => request("/v1/auth/refresh", { method: "POST", body: JSON.stringify(input) }),
    logout: (input) => request("/v1/auth/logout", { method: "POST", body: JSON.stringify(input) }),
    requestOtp: (input) => request("/v1/auth/otp/request", { method: "POST", body: JSON.stringify(input) }),
    verifyOtp: (input) => request("/v1/auth/otp/verify", { method: "POST", body: JSON.stringify(input) }),
    requestPasswordReset: (input) => request("/v1/auth/password-reset/request", { method: "POST", body: JSON.stringify(input) }),
    confirmPasswordReset: (input) => request("/v1/auth/password-reset/confirm", { method: "POST", body: JSON.stringify(input) }),
  },
  events: {
    list: ({ from, to, q }) => request(`/v1/events?${new URLSearchParams({ from, to, ...(q ? { q } : {}) })}`),
    create: (input) => request("/v1/events", { method: "POST", body: JSON.stringify(input) }),
    update: (id, input) => request(`/v1/events/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    remove: (id) => request(`/v1/events/${id}`, { method: "DELETE" }),
  },
  groups: {
    feed: () => request("/v1/groups/feed"),
    rsvp: (id, response) => request(`/v1/groups/invitations/${id}/rsvp`, { method: "POST", body: JSON.stringify({ response }) }),
  },
};
