#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=== FIXING ANIMATION AI API CONFIG ==="

cp public/app.js public/app.js.before-api-fix.js 2>/dev/null || true

cat > public/config.js <<'CONFIG'
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
CONFIG

if ! grep -q 'config.js' public/index.html; then
  sed -i 's#<script src="app.js"></script>#<script src="config.js"></script>\n<script src="app.js"></script>#' public/index.html
fi

npx cap sync android

git add public/config.js public/index.html public/app.js android capacitor.config.json package.json package-lock.json 2>/dev/null || true
git commit -m "Fix Android API configuration and sync Capacitor" || true
git push origin main

echo "=== FIX COMPLETE ==="
