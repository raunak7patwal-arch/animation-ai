const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const jobs = new Map();

/* =========================
   CORE
========================= */

function newJob(type, input) {
  const id = crypto.randomUUID();

  const job = {
    id,
    type,
    status: "queued",
    progress: 0,
    input,
    output: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  jobs.set(id, job);
  return job;
}

function success(res, data = {}) {
  res.json({
    success: true,
    ...data
  });
}

function error(res, message, code = 400) {
  res.status(code).json({
    success: false,
    error: message
  });
}

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  success(res, {
    name: "Animation AI API",
    version: "3.0.0",
    status: "online",
    paidAPIRequired: false
  });
});

/* =========================
   HEALTH
========================= */

app.get("/api/health", (req, res) => {
  success(res, {
    name: "Animation AI API",
    version: "3.0.0",
    status: "online",
    engine: "self-controlled",
    paidAPIRequired: false,
    modules: [
      "text-to-video",
      "image-to-video",
      "character-animation",
      "story-to-video",
      "image-generation",
      "voice",
      "youtube-analysis",
      "original-remix",
      "jobs",
      "memory",
      "router"
    ]
  });
});

/* =========================
   UNIVERSAL AI REQUEST
========================= */

app.post("/api/ai", (req, res) => {
  const command = String(req.body.command || "").trim();

  if (!command) {
    return error(res, "command is required");
  }

  const job = newJob("ai-command", {
    command,
    language: req.body.language || "hi"
  });

  success(res, {
    message: "AI request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   TEXT → VIDEO
========================= */

app.post("/api/video/text", (req, res) => {
  const prompt = String(req.body.prompt || "").trim();

  if (!prompt) {
    return error(res, "prompt is required");
  }

  const job = newJob("text-to-video", {
    prompt,
    duration: Number(req.body.duration || 5),
    width: Number(req.body.width || 832),
    height: Number(req.body.height || 480),
    fps: Number(req.body.fps || 16),
    language: req.body.language || "hi"
  });

  success(res, {
    message: "Text-to-video request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   IMAGE → VIDEO
========================= */

app.post("/api/video/image", (req, res) => {
  const image = String(req.body.image || "").trim();

  if (!image) {
    return error(res, "image is required");
  }

  const job = newJob("image-to-video", {
    image,
    prompt: String(req.body.prompt || ""),
    duration: Number(req.body.duration || 5)
  });

  success(res, {
    message: "Image-to-video request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   CHARACTER ANIMATION
========================= */

app.post("/api/video/character", (req, res) => {
  if (!req.body.character) {
    return error(res, "character is required");
  }

  const job = newJob("character-animation", {
    character: req.body.character,
    prompt: String(req.body.prompt || ""),
    duration: Number(req.body.duration || 5)
  });

  success(res, {
    message: "Character animation request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   STORY → VIDEO
========================= */

app.post("/api/video/story", (req, res) => {
  const story = String(req.body.story || "").trim();

  if (!story) {
    return error(res, "story is required");
  }

  const job = newJob("story-to-video", {
    story,
    scenes: Number(req.body.scenes || 5),
    language: req.body.language || "hi"
  });

  success(res, {
    message: "Story-to-video request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   IMAGE GENERATION
========================= */

app.post("/api/image", (req, res) => {
  const prompt = String(req.body.prompt || "").trim();

  if (!prompt) {
    return error(res, "prompt is required");
  }

  const job = newJob("image-generation", {
    prompt,
    width: Number(req.body.width || 1024),
    height: Number(req.body.height || 1024)
  });

  success(res, {
    message: "Image request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   VOICE
========================= */

app.post("/api/voice", (req, res) => {
  const text = String(req.body.text || "").trim();

  if (!text) {
    return error(res, "text is required");
  }

  const job = newJob("voice", {
    text,
    language: req.body.language || "hi",
    voice: req.body.voice || "default"
  });

  success(res, {
    message: "Voice request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   YOUTUBE ANALYSIS
========================= */

app.post("/api/youtube/analyze", (req, res) => {
  const url = String(req.body.url || "").trim();

  if (!url) {
    return error(res, "YouTube URL is required");
  }

  if (
    !url.includes("youtube.com") &&
    !url.includes("youtu.be")
  ) {
    return error(res, "Invalid YouTube URL");
  }

  const job = newJob("youtube-analysis", {
    url
  });

  success(res, {
    message: "YouTube analysis request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   ORIGINAL REMIX
========================= */

app.post("/api/remix/original", (req, res) => {
  const url = String(req.body.url || "").trim();

  if (!url) {
    return error(res, "url is required");
  }

  const job = newJob("original-remix", {
    source: url,
    concept: String(req.body.concept || ""),
    language: req.body.language || "hi"
  });

  success(res, {
    message: "Original remix request accepted",
    jobId: job.id,
    status: job.status
  });
});

/* =========================
   JOB LIST
========================= */

app.get("/api/jobs", (req, res) => {
  success(res, {
    jobs: Array.from(jobs.values())
  });
});

/* =========================
   JOB STATUS
========================= */

app.get("/api/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return error(res, "Job not found", 404);
  }

  success(res, { job });
});

/* =========================
   CANCEL JOB
========================= */

app.delete("/api/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return error(res, "Job not found", 404);
  }

  job.status = "cancelled";
  job.updatedAt = new Date().toISOString();

  success(res, {
    message: "Job cancelled",
    jobId: job.id
  });
});

/* =========================
   404
========================= */

app.use((req, res) => {
  error(res, "API endpoint not found", 404);
});

/* =========================
   START
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("======================================");
  console.log("          ANIMATION AI API");
  console.log("======================================");
  console.log(`Port: ${PORT}`);
  console.log("Paid API required: NO");
  console.log("Universal API: READY");
  console.log("======================================");
});
