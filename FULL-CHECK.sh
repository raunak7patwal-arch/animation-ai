#!/data/data/com.termux/files/usr/bin/bash

echo "========================================"
echo "   ANIMATION AI - FULL PROJECT CHECK"
echo "========================================"

echo ""
echo "📁 1. PROJECT FILES"
echo "----------------------------------------"
find . -maxdepth 3 -type f \
  ! -path "./node_modules/*" \
  ! -path "./.git/*" | sort | head -100

echo ""
echo "📦 2. PACKAGE.JSON"
echo "----------------------------------------"
cat package.json 2>/dev/null || echo "❌ package.json नहीं मिला"

echo ""
echo "🖥️ 3. SERVER PORT / LISTEN CHECK"
echo "----------------------------------------"
grep -nE "PORT|listen\(" server.js 2>/dev/null || echo "❌ server.js में PORT/listen नहीं मिला"

echo ""
echo "🏥 4. HEALTH ROUTE CHECK"
echo "----------------------------------------"
grep -nE '["'\'']/health|health' server.js 2>/dev/null || echo "❌ /health route नहीं मिला"

echo ""
echo "🌐 5. ALL EXPRESS ROUTES"
echo "----------------------------------------"
grep -nE 'app\.(get|post|put|delete|use)\(' server.js 2>/dev/null || echo "❌ Express routes नहीं मिले"

echo ""
echo "📄 6. STATIC / INDEX.HTML CHECK"
echo "----------------------------------------"
grep -nE 'express\.static|sendFile|index\.html' server.js 2>/dev/null || echo "⚠️ कोई static route नहीं मिला"

echo ""
echo "🔌 7. FRONTEND API CONFIG"
echo "----------------------------------------"
echo "--- public/config.js ---"
cat public/config.js 2>/dev/null || echo "❌ config.js नहीं मिला"

echo ""
echo "--- API calls in app.js ---"
grep -nE 'fetch\(|apiFetch|API_BASE_URL' public/app.js 2>/dev/null | head -50

echo ""
echo "📱 8. CAPACITOR CONFIG"
echo "----------------------------------------"
cat capacitor.config.* 2>/dev/null || echo "❌ Capacitor config नहीं मिला"

echo ""
echo "🤖 9. ANDROID API CONFIG"
echo "----------------------------------------"
grep -RniE '127\.0\.0\.1|localhost|onrender\.com|API_BASE_URL' \
android/app/src/main/assets/public 2>/dev/null | head -30

echo ""
echo "☁️ 10. RENDER CONFIG"
echo "----------------------------------------"
cat render.yaml 2>/dev/null || echo "⚠️ render.yaml नहीं मिला"

echo ""
echo "🔍 11. LOCAL SERVER SYNTAX TEST"
echo "----------------------------------------"
node --check server.js 2>&1

echo ""
echo "========================================"
echo "   IMPORTANT API TEST"
echo "========================================"

URL=$(grep -oE 'https://[^"]+onrender\.com' public/config.js 2>/dev/null | head -1)

if [ -n "$URL" ]; then
    echo "Backend URL मिला: $URL"

    echo ""
    echo "🏥 Testing /health:"
    curl -sS -i --max-time 30 "$URL/health" | head -25

    echo ""
    echo "🏠 Testing /:"
    curl -sS -i --max-time 30 "$URL/" | head -15
else
    echo "❌ public/config.js में Render URL नहीं मिला"
fi

echo ""
echo "========================================"
echo "CHECK COMPLETE"
echo "========================================"

echo ""
echo "ऊपर का पूरा output ChatGPT में भेजो।"
echo "उसके बाद exact एक fix command मिलेगा।"
