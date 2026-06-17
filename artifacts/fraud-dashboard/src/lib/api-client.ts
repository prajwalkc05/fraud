// Real API client for Fraud Sentinel backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://fraud-9lts.onrender.com";

console.log("API Base URL:", API_BASE_URL);

let _tokenGetter: (() => string | null) | null = null;

export function setAuthTokenGetter(fn: () => string | null) {
  _tokenGetter = fn;
}

function getHeaders() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = _tokenGetter?.();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export { fetchAPI, API_BASE_URL };
