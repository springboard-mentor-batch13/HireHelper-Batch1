const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // If the protocol is missing (e.g. "hire-helper-tztu.vercel.app"), prepend https://
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  
  // Remove trailing slash if present to avoid double slashes when concatenating with paths starting with /
  return url.replace(/\/$/, "");
};

export const API_BASE_URL = getApiBaseUrl();

let authToken = null;
try {
  authToken = localStorage.getItem("token");
} catch {
  authToken = null;
}

export function setToken(token) {
  authToken = token || null;
  try {
    if (authToken) localStorage.setItem("token", authToken);
    else localStorage.removeItem("token");
  } catch {
    // ignore storage failures (e.g. private mode / disabled)
  }

  // Notify route guards/components that auth state changed immediately.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}${path}?t=${Date.now()}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}


async function upload(path, formData) {
  const headers = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: formData,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  upload: (path, formData) => upload(path, formData),
};