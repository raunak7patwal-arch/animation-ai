const API_BASE_URL = "http://127.0.0.1:3000";

async function apiFetch(path, options = {}) {
  const url = API_BASE_URL + path;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(
      "Backend API उपलब्ध नहीं है। यह APK अकेले Node.js server नहीं चला सकता। Response: " +
      text.substring(0, 100)
    );
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "API request failed");
  }

  return response.json();
}
