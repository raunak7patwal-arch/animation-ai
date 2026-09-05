const express = require("express");
const cors = require("cors");
const path = require("path");

const { generateVideo } = require("./video-engine");

const app = express();
const PORT = process.env.PORT || 3000;

/* ==========================================
   MIDDLEWARE
========================================== */

app.use(cors());
app.use(express.json({ limit:

// ============================================================
// V14 — VIDEO → PARODY ENGINE
// ============================================================

app.post("/api/parody/analyze", async (req, res) => {
  try {
    const { url, style = "funny", comedy = "high" } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        error: "Video URL is required"
      });
    }

    const supported =
      /^https?:\/\//i.test(url) &&
      (
        /youtube\.com/i.test(url) ||
        /youtu\.be/i.test(url) ||
        /vimeo\.com/i.test(url) ||
        /dailymotion\.com/i.test(url) ||
        /https?:\/\//i.test(url)
      );

    if (!supported) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid video URL"
      });
    }

    const cleanUrl = url.trim();

    res.json({
      success: true,
      mode: "parody",
      sourceUrl: cleanUrl,
      style,
      comedy,
      analysis: {
        status: "ready",
        message:
          "Video reference accepted. A new transformative parody can be generated from the video's public/contextual information rather than copying its footage."
      }
    });

  } catch (err) {
    console.error("V14 parody analyze error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.post("/api/parody/script", async (req, res) => {
  try {
    const {
      url,
      style = "funny",
      comedy = "high",
      duration = "1 minutes"
    } = req.body || {};

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Video URL is required"
      });
    }

    const script = {
      title: "AI Generated Parody",
      sourceUrl: url,
      style,
      comedy,
      duration,
      rules: [
        "Create a substantially new script",
        "Use original fictional characters",
        "Use newly generated dialogue",
        "Use newly generated visuals",
        "Do not reproduce the source footage",
        "Do not reproduce the source audio",
        "Preserve only broad ideas needed for transformative parody"
      ],
      scenes: [
        {
          number: 1,
          type: "intro",
          instruction: "Create an original comedic opening inspired by the general premise."
        },
        {
          number: 2,
          type: "setup",
          instruction: "Introduce fictional characters and establish the parody situation."
        },
        {
          number: 3,
          type: "escalation",
          instruction: "Increase the comedy with an unexpected problem."
        },
        {
          number: 4,
          type: "chaos",
          instruction: "Create an original exaggerated comedic sequence."
        },
        {
          number: 5,
          type: "ending",
          instruction: "Finish with an original punchline."
        }
      ]
    };

    res.json({
      success: true,
      mode: "parody",
      script
    });

  } catch (err) {
    console.error("V14 parody script error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
 "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ==========================================
   STATIC FILES
========================================== */

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/output",
  express.static(path.join(__dirname, "output"))
);

app.use(
  "/audio",
  express.static(path.join(__dirname, "audio"))
);

/* ==========================================
   HEALTH CHECK
========================================== */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    app: "Animation AI",
    version: "3.0",
    status: "online",
    engines: {
      story: true,
      script: true,
      video: true
    }
  });
});

/* ==========================================
   STORY GENERATION
========================================== */

app.post("/generate", (req, res) => {
  try {
    const {
      prompt,
      duration = "5 minutes",
      voiceMode = "automatic"
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a story prompt"
      });
    }

    const project = {
      title: prompt.substring(0, 60),
      prompt,
      duration,
      voiceMode,

      characters: [
        {
          id: 1,
          name: "Aman",
          role: "Main Character",
          personality: "Funny and energetic",
          suggestedVoice: "Funny Male",
          voice: "Funny Male"
        },
        {
          id: 2,
          name: "Riya",
          role: "Friend",
          personality: "Smart and sarcastic",
          suggestedVoice: "Funny Female",
          voice: "Funny Female"
        },
        {
          id: 3,
          name: "Narrator",
          role: "Narrator",
          personality: "Expressive storyteller",
          suggestedVoice: "Story Narrator",
          voice: "Story Narrator"
        }
      ],

      scenes: [
        {
          sceneNumber: 1,
          type: "Introduction",
          description: `Story begins: ${prompt}`
        },
        {
          sceneNumber: 2,
          type: "Problem",
          description: "A strange and funny problem suddenly appears."
        },
        {
          sceneNumber: 3,
          type: "Discovery",
          description: "The characters discover something unexpected."
        },
        {
          sceneNumber: 4,
          type: "Funny Moment",
          description: "A funny mistake changes everything."
        },
        {
          sceneNumber: 5,
          type: "Plan",
          description: "The characters create a crazy plan."
        },
        {
          sceneNumber: 6,
          type: "Twist",
          description: "An unexpected twist surprises everyone."
        },
        {
          sceneNumber: 7,
          type: "Ending",
          description: "The story ends with a big funny surprise."
        }
      ],

      status: "Story and scenes generated successfully"
    };

    res.json({
      success: true,
      project
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* ==========================================
   VIDEO GENERATION
========================================== */

app.post("/generate-video", async (req, res) => {

  try {

    const {
      title,
      prompt,
      duration,
      quality,
      frameSize
    } = req.body;

    if (!prompt || !prompt.trim()) {

      return res.status(400).json({
        success: false,
        error: "Prompt is required"
      });

    }

    console.log("\n====================================");
    console.log("🎬 VIDEO GENERATION STARTED");
    console.log("====================================");

    const result = await generateVideo({
      title: title || "Animation AI Video",
      prompt,
      duration: duration || "5 minutes",
      quality: quality || "1080p",
      frameSize: frameSize || "16:9"
    });

    console.log("✅ VIDEO CREATED");
    console.log(result.videoFile);

    res.json({
      success: true,
      message: "Video generated successfully!",
      project: result
    });

  } catch (error) {

    console.error("❌ VIDEO GENERATION ERROR");
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/* ==========================================
   FRONTEND FALLBACK
========================================== */

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, "0.0.0.0", () => {

  console.log("\n====================================");
  console.log("🎬 Animation AI v3.0 is running!");
  console.log("🌍 Production server enabled");
  console.log(`📍 Port: ${PORT}`);
  console.log("🎭 Story Engine: ACTIVE");
  console.log("📝 Script Engine: ACTIVE");
  console.log("🎬 Video Engine: ACTIVE");
  console.log("====================================\n");

});
