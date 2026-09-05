const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.JARVIS_PORT || 3000;
const HOST = process.env.JARVIS_HOST || "0.0.0.0";

const ROOT = __dirname;
const JARVIS_DIR = path.join(ROOT, "JARVIS");
const DATA_DIR = path.join(JARVIS_DIR, "data");
const MEMORY_DIR = path.join(DATA_DIR, "memory");
const JOB_DIR = path.join(DATA_DIR, "jobs");
const CONFIG_DIR = path.join(JARVIS_DIR, "config");

for (const d of [JARVIS_DIR, DATA_DIR, MEMORY_DIR, JOB_DIR, CONFIG_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

const OWNER_FILE = path.join(CONFIG_DIR, "owner.json");
const MEMORY_FILE = path.join(MEMORY_DIR, "memory.json");

function loadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let owner = loadJSON(OWNER_FILE, null);

if (!owner) {
  owner = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    apiKey: crypto.randomBytes(32).toString("hex")
  };
  saveJSON(OWNER_FILE, owner);
}

let memory = loadJSON(MEMORY_FILE, {
  ownerId: owner.id,
  createdAt: new Date().toISOString(),
  facts: [],
  conversations: [],
  preferences: {},
  projects: [],
  notes: []
});

function saveMemory() {
  saveJSON(MEMORY_FILE, memory);
}

const jobs = new Map();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({
    name: "JARVIS",
    api: "JARVIS API",
    status: "online",
    version: "1.0.0",
    ownerLocked: true,
    paidProvidersRequired: false,
    memory: true,
    modules: [
      "chat",
      "memory",
      "text-to-video",
      "image-to-video",
      "story-to-video",
      "character-animation",
      "image-generation",
      "voice",
      "youtube-analysis",
      "remix",
      "cybersecurity",
      "device-tools",
      "backup"
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    name: "JARVIS",
    api: "JARVIS API",
    status: "online",
    time: new Date().toISOString(),
    ownerLocked: true,
    memoryReady: fs.existsSync(MEMORY_FILE),
    paidProvider: false
  });
});

function auth(req, res, next) {
  const key =
    req.headers["x-jarvis-key"] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!key || key !== owner.apiKey) {
    return res.status(401).json({
      success: false,
      error: "OWNER_AUTH_REQUIRED",
      message: "JARVIS is locked. Owner authentication required."
    });
  }

  next();
}

app.post("/api/owner/unlock", (req, res) => {
  const { key } = req.body || {};

  if (!key || key !== owner.apiKey) {
    return res.status(401).json({
      success: false,
      error: "INVALID_OWNER_KEY"
    });
  }

  res.json({
    success: true,
    unlocked: true,
    ownerId: owner.id,
    message: "JARVIS owner verified."
  });
});

app.get("/api/memory", auth, (req, res) => {
  res.json({
    success: true,
    memory
  });
});

app.post("/api/memory", auth, (req, res) => {
  const { type = "fact", text, data } = req.body || {};

  if (!text && !data) {
    return res.status(400).json({
      success: false,
      error: "MEMORY_CONTENT_REQUIRED"
    });
  }

  const item = {
    id: crypto.randomUUID(),
    type,
    text: text || null,
    data: data || null,
    createdAt: new Date().toISOString()
  };

  memory.facts.push(item);
  saveMemory();

  res.json({
    success: true,
    saved: item
  });
});

app.post("/api/chat", auth, (req, res) => {
  const message = String(req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "MESSAGE_REQUIRED"
    });
  }

  const item = {
    id: crypto.randomUUID(),
    role: "user",
    message,
    time: new Date().toISOString()
  };

  memory.conversations.push(item);
  saveMemory();

  let reply =
    "मैं JARVIS हूँ। तुम्हारा message मेरी owner memory में सुरक्षित कर दिया गया है।";

  const lower = message.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi") || message.includes("हेलो")) {
    reply = "नमस्ते। JARVIS online है।";
  }

  if (message.includes("तुम कौन") || lower.includes("who are you")) {
    reply = "मैं JARVIS हूँ — तुम्हारा local-first personal AI core.";
  }

  if (message.includes("याद रखो") || message.includes("याद रखना")) {
    const fact = message
      .replace("याद रखो", "")
      .replace("याद रखना", "")
      .trim();

    if (fact) {
      memory.facts.push({
        id: crypto.randomUUID(),
        type: "user_memory",
        text: fact,
        createdAt: new Date().toISOString()
      });
      saveMemory();
      reply = "ठीक है। यह JARVIS memory में save हो गया है।";
    }
  }

  memory.conversations.push({
    id: crypto.randomUUID(),
    role: "jarvis",
    message: reply,
    time: new Date().toISOString()
  });

  saveMemory();

  res.json({
    success: true,
    ai: "JARVIS",
    reply,
    memorySaved: true
  });
});

function createJob(type, input) {
  const id = crypto.randomUUID();

  const job = {
    id,
    type,
    status: "queued",
    input,
    createdAt: new Date().toISOString()
  };

  jobs.set(id, job);

  saveJSON(
    path.join(JOB_DIR, `${id}.json`),
    job
  );

  return job;
}

app.post("/api/video/text", auth, (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "PROMPT_REQUIRED"
    });
  }

  res.json({
    success: true,
    job: createJob("text-to-video", {
      prompt,
      duration: req.body.duration || 5,
      language: req.body.language || "hi"
    }),
    engine: "JARVIS Animation Engine"
  });
});

app.post("/api/video/image", auth, (req, res) => {
  const image = req.body?.image || req.body?.imagePath;

  if (!image) {
    return res.status(400).json({
      success: false,
      error: "IMAGE_REQUIRED"
    });
  }

  res.json({
    success: true,
    job: createJob("image-to-video", {
      image
    }),
    engine: "JARVIS Animation Engine"
  });
});

app.post("/api/video/story", auth, (req, res) => {
  const story = String(req.body?.story || "").trim();

  if (!story) {
    return res.status(400).json({
      success: false,
      error: "STORY_REQUIRED"
    });
  }

  res.json({
    success: true,
    job: createJob("story-to-video", {
      story
    }),
    engine: "JARVIS Animation Engine"
  });
});

app.post("/api/video/character", auth, (req, res) => {
  res.json({
    success: true,
    job: createJob("character-animation", req.body || {}),
    engine: "JARVIS Character Engine"
  });
});

app.post("/api/image", auth, (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "PROMPT_REQUIRED"
    });
  }

  res.json({
    success: true,
    job: createJob("image-generation", { prompt }),
    engine: "JARVIS Image Engine"
  });
});

app.post("/api/voice", auth, (req, res) => {
  const text = String(req.body?.text || "").trim();

  if (!text) {
    return res.status(400).json({
      success: false,
      error: "TEXT_REQUIRED"
    });
  }

  res.json({
    success: true,
    job: createJob("voice", {
      text,
      language: req.body.language || "hi"
    }),
    engine: "JARVIS Voice Engine"
  });
});

app.post("/api/youtube/analyze", auth, (req, res) => {
  const url = String(req.body?.url || "").trim();

  if (
    !url.includes("youtube.com") &&
    !url.includes("youtu.be")
  ) {
    return res.status(400).json({
      success: false,
      error: "INVALID_YOUTUBE_URL"
    });
  }

  res.json({
    success: true,
    job: createJob("youtube-analysis", {
      url
    }),
    engine: "JARVIS YouTube Intelligence"
  });
});

app.post("/api/remix", auth, (req, res) => {
  res.json({
    success: true,
    job: createJob("transformative-remix", req.body || {}),
    note: "Use only media you own or are authorized to transform."
  });
});

app.get("/api/jobs", auth, (req, res) => {
  res.json({
    success: true,
    jobs: Array.from(jobs.values())
  });
});

app.get("/api/jobs/:id", auth, (req, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: "JOB_NOT_FOUND"
    });
  }

  res.json({
    success: true,
    job
  });
});

app.post("/api/backup", auth, (req, res) => {
  const backup = {
    jarvis: "JARVIS",
    version: "1.0.0",
    ownerId: owner.id,
    memory,
    createdAt: new Date().toISOString()
  };

  const file = path.join(
    JARVIS_DIR,
    `backup-${Date.now()}.json`
  );

  saveJSON(file, backup);

  res.json({
    success: true,
    backup: path.relative(ROOT, file)
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "JARVIS_ENDPOINT_NOT_FOUND"
  });
});



app.get('/api/modules', (req,res)=>{
  res.json({
    success:true,
    name:'JARVIS',
    api:'JARVIS API',
    modules:JARVIS_MODULES
  });
});

app.get('/api/media/status', (req,res)=>{
  res.json({
    success:true,
    ffmpeg:JARVIS_MEDIA_ENGINE.ffmpegAvailable(),
    mediaEngine:true
  });
});

app.listen(PORT, HOST, () => {
  console.log("");
  console.log("======================================");
  console.log("              JARVIS");
  console.log("           JARVIS API");
  console.log("======================================");
  console.log(`Server: http://${HOST}:${PORT}`);
  console.log("Owner lock: ENABLED");
  console.log("Memory: ENABLED");
  console.log("Paid API dependency: NONE");
  console.log("======================================");
  console.log("");
});
