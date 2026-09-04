const API_BASE_URL = "https://animation-ai-1.onrender.com";

async function apiFetch(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const raw = await response.text();
  const contentType = response.headers.get("content-type") || "";

  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (error) {
    throw new Error(
      "Backend API error: JSON expected लेकिन server ने HTML/invalid response दिया. HTTP " +
      response.status
    );
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Server request failed");
  }

  return data;
}

window.API_BASE_URL = API_BASE_URL;
window.apiFetch = apiFetch;
