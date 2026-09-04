const API_BASE_URL = "https://animation-ai-1.onrender.com";

async function apiFetch(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const type = response.headers.get("content-type") || "";
  const raw = await response.text();

  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      "Server API ने JSON नहीं भेजा. Status: " +
      response.status +
      " | " +
      raw.substring(0, 150)
    );
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Server request failed");
  }

  return data;
}

window.API_BASE_URL = API_BASE_URL;
window.apiFetch = apiFetch;
