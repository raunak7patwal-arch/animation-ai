#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=========================================="
echo " ADDING VIDEO REMIX / STYLE FEATURE"
echo "=========================================="

# Backup
cp server.js server.js.before-remix.js
cp public/index.html public/index.html.before-remix.html
cp public/app.js public/app.js.before-remix.js

# ------------------------------------------------
# ADD NEW BACKEND ROUTES BEFORE app.listen()
# ------------------------------------------------

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

marker = 'app.listen(PORT'

if '/api/remix/analyze' not in s:

    code = r'''

/* ============================================
   VIDEO REFERENCE → ORIGINAL REMIX ENGINE
   ============================================ */

function isAllowedVideoReference(url) {
  try {
    const u = new URL(url);
    return [
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "m.youtube.com",
      "vimeo.com"
    ].includes(u.hostname);
  } catch {
    return false;
  }
}

app.post("/api/remix/analyze", async (req, res) => {
  try {
    const { url, style = "animated", intensity = "medium" } = req.body || {};

    if (!url || !isAllowedVideoReference(url)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid supported video reference URL."
      });
    }

    return res.json({
      success: true,
      mode: "reference-remix",
      reference: url,
      style,
      intensity,
      message:
        "Reference accepted. The new video will be generated as an original work inspired by broad visual and storytelling characteristics."
    });

  } catch (error) {
    console.error("Remix analyze error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Unable to analyze reference."
    });
  }
});


app.post("/api/remix/generate", async (req, res) => {
  try {

    const {
      url,
      title = "Original AI Remix",
      style = "animated",
      intensity = "medium",
      prompt = "",
      duration = "30 seconds",
      quality = "720p",
      frameSize = "16:9"
    } = req.body || {};

    if (!url || !isAllowedVideoReference(url)) {
      return res.status(400).json({
        success: false,
        error: "A valid video reference URL is required."
      });
    }

    const stylePrompts = {
      animated:
        "Create a polished original animated interpretation with expressive characters and cinematic movement.",
      anime:
        "Create an original anime-inspired visual treatment with dynamic camera movement and expressive scenes.",
      cartoon:
        "Create an original colorful cartoon interpretation with exaggerated expressions and smooth animation.",
      cinematic:
        "Create an original cinematic reinterpretation with dramatic lighting and camera composition.",
      funny:
        "Create an original humorous animated interpretation with comedic timing and fresh characters."
    };

    const intensityPrompts = {
      low: "Keep only a very loose thematic inspiration.",
      medium: "Use broad storytelling inspiration while creating completely new scenes and characters.",
      high: "Transform the concept heavily into a distinctly new creative work."
    };

    const generationPrompt = `
TITLE: ${title}

VIDEO REFERENCE:
${url}

IMPORTANT:
Do not copy, reproduce, download, or recreate the source video frame-by-frame.
Do not reuse the original video's exact dialogue, soundtrack, characters, or scenes.

Create a NEW and ORIGINAL animated video.

STYLE:
${stylePrompts[style] || stylePrompts.animated}

TRANSFORMATION:
${intensityPrompts[intensity] || intensityPrompts.medium}

USER CREATIVE DIRECTION:
${prompt || "Create a fresh entertaining story with original characters."}

OUTPUT REQUIREMENTS:
- Original characters
- Original scenes
- New dialogue/storytelling
- Smooth animation
- Suitable for ${frameSize}
- Target duration: ${duration}
- Target quality: ${quality}

The reference is only for broad creative inspiration.
`;

    const baseUrl =
      process.env.PUBLIC_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      `http://127.0.0.1:${PORT}`;

    const response = await fetch(`${baseUrl}/generate-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        prompt: generationPrompt,
        duration,
        quality,
        frameSize,
        mode: "reference-remix"
      })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "Video pipeline returned a non-JSON response: " +
        text.substring(0, 200)
      );
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json({
      success: true,
      mode: "reference-remix",
      reference: url,
      original: true,
      ...data
    });

  } catch (error) {
    console.error("Remix generation error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Remix generation failed."
    });
  }
});

'''

    s = s.replace(marker, code + "\n" + marker)
    p.write_text(s)

print("Backend remix routes added.")
PY


# ------------------------------------------------
# ADD UI
# ------------------------------------------------

python3 - <<'PY'
from pathlib import Path

p = Path("public/index.html")
s = p.read_text()

if 'id="remixPanel"' not in s:

    panel = r'''

      <!-- VIDEO REFERENCE REMIX -->

      <section id="remixPanel" class="panel parody-panel">

        <div class="panel-title">
          🎬 Video → AI Remix
        </div>

        <p class="panel-subtitle">
          Use a video as creative reference and generate a new original stylized animation.
        </p>

        <label>🔗 Video Reference URL</label>

        <input
          id="remixUrl"
          type="url"
          placeholder="Paste YouTube video link..."
          autocomplete="off"
        >

        <div class="parody-grid">

          <div>
            <label>🎨 Remix Style</label>

            <select id="remixStyle">
              <option value="animated">✨ Animated</option>
              <option value="anime">⚡ Anime Inspired</option>
              <option value="cartoon">🎨 Cartoon</option>
              <option value="cinematic">🎬 Cinematic</option>
              <option value="funny">😂 Funny</option>
            </select>
          </div>

          <div>
            <label>🔥 Transformation</label>

            <select id="remixIntensity">
              <option value="low">Light</option>
              <option value="medium" selected>Medium</option>
              <option value="high">Heavy</option>
            </select>
          </div>

        </div>

        <label>✍️ Your Creative Direction</label>

        <textarea
          id="remixPrompt"
          placeholder="Example: Turn the idea into a funny school animation with completely new characters..."
        ></textarea>

        <button
          id="analyzeRemixBtn"
          class="primary-btn"
          type="button"
        >
          🔍 Analyze Reference
        </button>

        <button
          id="generateRemixBtn"
          class="primary-btn"
          type="button"
          style="display:none"
        >
          🚀 Generate Original Remix
        </button>

        <div
          id="remixStatus"
          class="status-box"
        ></div>

      </section>

'''

    s = s.replace("</main>", panel + "\n    </main>")
    p.write_text(s)

print("Remix UI added.")
PY


# ------------------------------------------------
# ADD FRONTEND LOGIC
# ------------------------------------------------

cat >> public/app.js <<'EOF'


/* ============================================
   VIDEO REFERENCE REMIX FRONTEND
   ============================================ */

(() => {

  const remixUrl =
    document.getElementById("remixUrl");

  const remixStyle =
    document.getElementById("remixStyle");

  const remixIntensity =
    document.getElementById("remixIntensity");

  const remixPrompt =
    document.getElementById("remixPrompt");

  const analyzeRemixBtn =
    document.getElementById("analyzeRemixBtn");

  const generateRemixBtn =
    document.getElementById("generateRemixBtn");

  const remixStatus =
    document.getElementById("remixStatus");

  if (!remixUrl || !analyzeRemixBtn) return;

  function remixMessage(message, error = false) {
    remixStatus.textContent = message;
    remixStatus.style.display = "block";
    remixStatus.style.opacity = "1";
  }

  analyzeRemixBtn.addEventListener("click", async () => {

    const url = remixUrl.value.trim();

    if (!url) {
      remixMessage("❌ Please paste a video URL.");
      return;
    }

    analyzeRemixBtn.disabled = true;
    analyzeRemixBtn.textContent = "⏳ Analyzing...";

    remixMessage("🔍 Checking video reference...");

    try {

      const response = await fetch(
        window.API_BASE_URL + "/api/remix/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url,
            style: remixStyle.value,
            intensity: remixIntensity.value
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Reference analysis failed."
        );
      }

      remixMessage(
        "✅ Reference ready! Choose your creative direction and generate the original remix."
      );

      generateRemixBtn.style.display = "block";

    } catch (error) {

      remixMessage(
        "❌ " + error.message
      );

    } finally {

      analyzeRemixBtn.disabled = false;
      analyzeRemixBtn.textContent =
        "🔍 Analyze Reference";

    }

  });


  generateRemixBtn.addEventListener("click", async () => {

    const url = remixUrl.value.trim();

    if (!url) {
      remixMessage("❌ Video URL is missing.");
      return;
    }

    generateRemixBtn.disabled = true;

    generateRemixBtn.textContent =
      "⏳ Creating Original Remix...";

    remixMessage(
      "🎬 Sending your original remix to the Animation AI engine..."
    );

    try {

      const titleInput =
        document.getElementById("title");

      const durationInput =
        document.getElementById("duration");

      const qualityInput =
        document.getElementById("quality");

      const frameInput =
        document.getElementById("frameSize");

      const response = await fetch(
        window.API_BASE_URL + "/api/remix/generate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            url,

            title:
              titleInput?.value ||
              "Original AI Video Remix",

            style:
              remixStyle.value,

            intensity:
              remixIntensity.value,

            prompt:
              remixPrompt.value,

            duration:
              durationInput?.value ||
              "30 seconds",

            quality:
              qualityInput?.value ||
              "720p",

            frameSize:
              frameInput?.value ||
              "16:9"

          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
          data.message ||
          "Video generation failed."
        );
      }

      remixMessage(
        "🚀 Generation started successfully!"
      );

      console.log(
        "Remix result:",
        data
      );

    } catch (error) {

      remixMessage(
        "❌ " + error.message
      );

    } finally {

      generateRemixBtn.disabled = false;

      generateRemixBtn.textContent =
        "🚀 Generate Original Remix";

    }

  });

})();

