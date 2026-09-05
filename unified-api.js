require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const {
  wavespeedSubmit,
  wavespeedResult
} = require("./api/providers");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

for (const dir of ["uploads", "outputs", "temp"]) {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Animation AI Unified API",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    api: "Animation AI Unified API",
    status: "ready",
    providers: {
      wavespeed: Boolean(process.env.WAVESPEED_API_KEY),
      fal: Boolean(process.env.FAL_KEY),
      huggingface: Boolean(process.env.HF_TOKEN)
    },
    modules: [
      "jarvis",
      "text-to-video",
      "image-to-video",
      "character-animation",
      "story-to-video",
      "voice",
      "image",
      "youtube-analysis",
      "original-remix"
    ]
  });
});

/*
  JARVIS
*/
app.post("/api/jarvis", async (req, res) => {
  const command = String(req.body.command || "").trim();

  if (!command) {
    return res.status(400).json({
      success: false,
      error: "command is required"
    });
  }

  res.json({
    success: true,
    module: "jarvis",
    command,
    understood: true,
    actions: [
      "command_received",
      "workflow_planning",
      "provider_selection"
    ],
    note: "AI command execution layer is ready for provider/model integration."
  });
});

/*
  TEXT -> VIDEO
*/
app.post("/api/video/text", async (req, res) => {
  try {
    const prompt = String(req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "prompt is required"
      });
    }

    const duration = Number(req.body.duration || 5);
    const size = req.body.size || "832*480";

    const task = await wavespeedSubmit(
      "wavespeed-ai/wan-2.2/t2v-480p-ultra-fast",
      {
        prompt,
        duration,
        size,
        seed: Number.isInteger(req.body.seed)
          ? req.body.seed
          : -1
      }
    );

    res.json({
      success: true,
      type: "text-to-video",
      provider: "wavespeed",
      jobId: task.id,
      status: task.status || "created"
    });

  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      provider: error.provider || "wavespeed",
      error: error.message,
      details: error.data || null
    });
  }
});

/*
  VIDEO JOB STATUS
*/
app.get("/api/video/status/:jobId", async (req, res) => {
  try {
    const result = await wavespeedResult(req.params.jobId);

    res.json({
      success: true,
      provider: "wavespeed",
      jobId: req.params.jobId,
      result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/*
  IMAGE -> VIDEO
  Generic interface; model adapter can be connected later.
*/
app.post("/api/video/image", (req, res) => {
  res.json({
    success: true,
    type: "image-to-video",
    status: "interface-ready",
    message: "Image-to-video adapter is ready to be connected."
  });
});

/*
  CHARACTER ANIMATION
*/
app.post("/api/video/character", (req, res) => {
  res.json({
    success: true,
    type: "character-animation",
    status: "interface-ready"
  });
});

/*
  STORY -> VIDEO
*/
app.post("/api/video/story", (req, res) => {
  const story = String(req.body.story || "").trim();

  if (!story) {
    return res.status(400).json({
      success: false,
      error: "story is required"
    });
  }

  res.json({
    success: true,
    type: "story-to-video",
    status: "planning",
    pipeline: [
      "story-analysis",
      "script",
      "characters",
      "scenes",
      "voice",
      "animation",
      "ffmpeg-stitch",
      "final-mp4"
    ]
  });
});

/*
  VOICE
*/
app.post("/api/voice", (req, res) => {
  res.json({
    success: true,
    type: "voice",
    status: "interface-ready",
    text: req.body.text || ""
  });
});

/*
  IMAGE
*/
app.post("/api/image", (req, res) => {
  res.json({
    success: true,
    type: "image-generation",
    status: "interface-ready",
    prompt: req.body.prompt || ""
  });
});

/*
  YOUTUBE ANALYSIS
*/
app.post("/api/youtube/analyze", (req, res) => {
  const url = String(req.body.url || "").trim();

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "YouTube URL is required"
    });
  }

  res.json({
    success: true,
    type: "youtube-analysis",
    url,
    status: "analysis-interface-ready",
    analysis: {
      scenes: [],
      topics: [],
      structure: [],
      pacing: [],
      originalRemixIdeas: []
    },
    note:
      "URL analysis must use permitted metadata/transcript or user-authorized media. The system will not reproduce another creator's video."
  });
});

/*
  ORIGINAL REMIX / PARODY
*/
app.post("/api/remix/original", (req, res) => {
  const url = String(req.body.url || "").trim();

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "url is required"
    });
  }

  res.json({
    success: true,
    type: "original-remix",
    status: "planning",
    source: url,
    pipeline: [
      "source-analysis",
      "teacher-style-breakdown",
      "new-concept",
      "new-script",
      "new-characters",
      "new-scenes",
      "voice",
      "animation",
      "final-video"
    ],
    rule:
      "Create a new transformative work; do not copy the source video's footage, dialogue, audio, characters, or scene-by-scene expression."
  });
});

app.listen(PORT, () => {
  console.log(`Animation AI Unified API running on port ${PORT}`);
});
