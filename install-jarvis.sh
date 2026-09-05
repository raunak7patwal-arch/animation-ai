#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=============================================="
echo "        JARVIS - MASTER CORE INSTALLER"
echo "=============================================="

ROOT="$HOME/animation-ai"
cd "$ROOT"

mkdir -p \
  jarvis/{core,skills,tools,memory,backup,logs,config} \
  jarvis/data/{conversations,jobs,projects} \
  jarvis/workspace \
  uploads outputs temp

touch jarvis/memory/conversations.json
touch jarvis/memory/preferences.json
touch jarvis/memory/facts.json
touch jarvis/logs/actions.jsonl

[ -s jarvis/memory/conversations.json ] || echo '[]' > jarvis/memory/conversations.json
[ -s jarvis/memory/preferences.json ] || echo '{}' > jarvis/memory/preferences.json
[ -s jarvis/memory/facts.json ] || echo '[]' > jarvis/memory/facts.json

cat > jarvis/config/config.js <<'EOF'
require("dotenv").config();

module.exports = {
  name: "JARVIS",
  version: "1.0.0",

  host: process.env.JARVIS_HOST || "127.0.0.1",
  port: Number(process.env.JARVIS_PORT || 3010),

  maxMemoryItems: Number(process.env.JARVIS_MAX_MEMORY || 500),
  maxRequestSize: process.env.JARVIS_MAX_REQUEST || "2mb",

  providers: {
    wavespeed: Boolean(process.env.WAVESPEED_API_KEY),
    fal: Boolean(process.env.FAL_KEY),
    huggingface: Boolean(process.env.HF_TOKEN)
  },

  security: {
    rootMode: false,
    systemPartitionAccess: false,
    arbitraryShell: false,
    destructiveActionsRequireConfirmation: true
  }
};
EOF

cat > jarvis/core/memory.js <<'EOF'
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BASE = path.join(__dirname, "..", "memory");

function file(name) {
  return path.join(BASE, name);
}

function readJSON(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file(name), "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(name, data) {
  const tmp = file(name) + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file(name));
}

function rememberConversation(user, assistant) {
  const data = readJSON("conversations.json", []);

  data.push({
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    user: String(user).slice(0, 10000),
    assistant: String(assistant).slice(0, 20000)
  });

  while (data.length > 500) data.shift();

  writeJSON("conversations.json", data);
}

function getRecent(limit = 10) {
  const data = readJSON("conversations.json", []);
  return data.slice(-limit);
}

function addFact(fact) {
  const data = readJSON("facts.json", []);

  const clean = String(fact).trim().slice(0, 2000);

  if (!clean) return;

  if (!data.includes(clean)) {
    data.push(clean);
  }

  while (data.length > 200) data.shift();

  writeJSON("facts.json", data);
}

function getFacts() {
  return readJSON("facts.json", []);
}

function savePreferences(data) {
  writeJSON("preferences.json", data || {});
}

function getPreferences() {
  return readJSON("preferences.json", {});
}

module.exports = {
  rememberConversation,
  getRecent,
  addFact,
  getFacts,
  savePreferences,
  getPreferences
};
EOF

cat > jarvis/core/router.js <<'EOF'
function detectIntent(text) {
  const t = String(text).toLowerCase();

  if (
    /(video|वीडियो|animation|एनीमेशन|cartoon|कार्टून|clip|scene|सीन)/i.test(t)
  ) {
    if (/(image|photo|चित्र|तस्वीर)/i.test(t)) return "image-to-video";
    if (/(story|कहानी|स्टोरी)/i.test(t)) return "story-to-video";
    return "text-to-video";
  }

  if (/(youtube|यूट्यूब)/i.test(t)) {
    if (/(remix|रीमिक्स|parody|पैरोडी|analyze|analysis|विश्लेषण)/i.test(t)) {
      return "youtube-analysis";
    }
    return "youtube";
  }

  if (/(voice|आवाज|बोलो|speak|speech|tts)/i.test(t)) {
    return "voice";
  }

  if (/(image|photo|चित्र|तस्वीर|thumbnail|थंबनेल)/i.test(t)) {
    return "image";
  }

  if (
    /(nmap|wireshark|dns|http|linux|linux|termux|cyber|cybersecurity|security|network|vulnerability|vulnerability|ctf|penetration|pentest|malware|exploit)/i.test(t)
  ) {
    return "cybersecurity";
  }

  if (
    /(file|folder|directory|storage|battery|device|फोन|मोबाइल|termux command|command चलाओ|system info)/i.test(t)
  ) {
    return "device";
  }

  if (/(backup|बैकअप|export|transfer|restore|मूव)/i.test(t)) {
    return "backup";
  }

  return "chat";
}

function makePlan(intent, text) {
  const plans = {
    chat: ["understand", "answer"],
    cybersecurity: ["classify-security-task", "provide-technical-guidance"],
    "text-to-video": ["parse-video-request", "select-video-provider", "create-job"],
    "image-to-video": ["parse-image-input", "select-video-provider", "create-job"],
    "story-to-video": ["parse-story", "split-scenes", "create-video-jobs", "stitch"],
    voice: ["parse-voice-request", "select-voice-provider"],
    image: ["parse-image-request", "select-image-provider"],
    "youtube-analysis": ["validate-url", "analyze-permitted-data", "create-original-remix-plan"],
    youtube: ["validate-url", "read-permitted-metadata"],
    device: ["classify-device-action", "check-permission", "execute-safe-action"],
    backup: ["collect-user-space-data", "create-archive"]
  };

  return {
    intent,
    input: text,
    steps: plans[intent] || plans.chat
  };
}

module.exports = { detectIntent, makePlan };
EOF

cat > jarvis/core/security.js <<'EOF'
const blocked = [
  /rm\s+-rf\s+\/\s*$/i,
  /mkfs(\s|$)/i,
  /dd\s+if=.*of=\/dev/i,
  /:\(\)\s*\{\s*:\|:\s*&\s*\};:/,
  /chmod\s+777\s+\//i,
  /su\s*$/i,
  /sudo\s+/i,
  /fastboot/i,
  /bootloader/i,
  /recovery\s+flash/i
];

const highImpact = [
  /delete/i,
  /remove/i,
  /wipe/i,
  /format/i,
  /shutdown/i,
  /reboot/i,
  /factory reset/i,
  /send money/i,
  /publish/i
];

function inspectCommand(command) {
  const value = String(command || "");

  for (const rule of blocked) {
    if (rule.test(value)) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: "Protected system/root operation blocked."
      };
    }
  }

  for (const rule of highImpact) {
    if (rule.test(value)) {
      return {
        allowed: false,
        requiresConfirmation: true,
        reason: "High-impact operation requires explicit confirmation."
      };
    }
  }

  return {
    allowed: true,
    requiresConfirmation: false,
    reason: "Allowed user-space operation."
  };
}

module.exports = { inspectCommand };
EOF

cat > jarvis/tools/termux.js <<'EOF'
const { execFile } = require("child_process");

const SAFE_COMMANDS = new Set([
  "pwd",
  "ls",
  "whoami",
  "id",
  "uname",
  "date",
  "df",
  "du",
  "uptime",
  "pm",
  "termux-battery-status",
  "termux-wifi-connectioninfo"
]);

function runSafe(command, args = []) {
  return new Promise((resolve, reject) => {
    if (!SAFE_COMMANDS.has(command)) {
      return reject(new Error("Command not allowed by JARVIS Termux policy."));
    }

    execFile(command, args, {
      timeout: 10000,
      maxBuffer: 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      resolve({
        stdout: stdout || "",
        stderr: stderr || ""
      });
    });
  });
}

module.exports = { runSafe };
EOF

cat > jarvis/skills/video.js <<'EOF'
const {
  wavespeedSubmit,
  wavespeedResult
} = require("../../api/providers");

async function textToVideo(input) {
  if (!process.env.WAVESPEED_API_KEY) {
    return {
      success: false,
      provider: "wavespeed",
      status: "missing-or-empty-credits",
      message: "WaveSpeed API key/credits are not available."
    };
  }

  const prompt = String(input.prompt || "").trim();

  if (!prompt) {
    throw new Error("Video prompt is required.");
  }

  const duration = [5, 8].includes(Number(input.duration))
    ? Number(input.duration)
    : 5;

  const task = await wavespeedSubmit(
    "wavespeed-ai/wan-2.2/t2v-480p-ultra-fast",
    {
      prompt,
      duration,
      size: input.size || "832*480",
      seed: Number.isInteger(input.seed) ? input.seed : -1
    }
  );

  return {
    success: true,
    provider: "wavespeed",
    jobId: task.id,
    status: task.status || "created"
  };
}

async function videoStatus(jobId) {
  return wavespeedResult(jobId);
}

module.exports = {
  textToVideo,
  videoStatus
};
EOF

cat > jarvis/skills/youtube.js <<'EOF'
function extractVideoId(url) {
  const value = String(url || "").trim();

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtu\.be\/([^?&]+)/i,
    /youtube\.com\/shorts\/([^?&]+)/i
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function analyzeUrl(url) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL.");
  }

  return {
    success: true,
    videoId,
    source: url,
    mode: "permitted-metadata-analysis",
    analysis: {
      scenes: [],
      topics: [],
      structure: [],
      pacing: [],
      originalRemixIdeas: []
    },
    note:
      "URL-only mode does not download or reproduce third-party video. Authorized media can be supplied separately for deeper processing."
  };
}

module.exports = { extractVideoId, analyzeUrl };
EOF

cat > jarvis/core/backup.js <<'EOF'
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

function createBackup() {
  return new Promise((resolve, reject) => {
    const root = path.join(__dirname, "..", "..");
    const backupDir = path.join(root, "jarvis", "backup");

    fs.mkdirSync(backupDir, { recursive: true });

    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const output = path.join(
      backupDir,
      `JARVIS-backup-${stamp}.tar.gz`
    );

    const args = [
      "-czf",
      output,
      "jarvis",
      "api",
      "package.json",
      ".env.example"
    ];

    execFile("tar", args, {
      cwd: root,
      timeout: 120000
    }, (error) => {
      if (error) return reject(error);

      resolve({
        success: true,
        file: output,
        message: "JARVIS user-space backup created."
      });
    });
  });
}

module.exports = { createBackup };
EOF

cat > jarvis/core/brain.js <<'EOF'
const {
  detectIntent,
  makePlan
} = require("./router");

const memory = require("./memory");
const security = require("./security");
const termux = require("../tools/termux");
const video = require("../skills/video");
const youtube = require("../skills/youtube");
const backup = require("./backup");

async function answer(command, body = {}) {
  const text = String(command || "").trim();

  if (!text) {
    return {
      success: false,
      error: "command is required"
    };
  }

  const intent = detectIntent(text);
  const plan = makePlan(intent, text);

  let result = null;

  if (intent === "text-to-video") {
    result = await video.textToVideo({
      prompt: body.prompt || text,
      duration: body.duration,
      size: body.size,
      seed: body.seed
    });
  }

  else if (intent === "youtube-analysis") {
    result = youtube.analyzeUrl(body.url || text);
  }

  else if (intent === "backup") {
    result = await backup.createBackup();
  }

  else if (intent === "device") {
    const cmd = String(body.command || "").trim();

    const check = security.inspectCommand(cmd);

    if (!check.allowed) {
      result = {
        success: false,
        blocked: true,
        requiresConfirmation: check.requiresConfirmation,
        reason: check.reason
      };
    } else {
      const parts = cmd.split(/\s+/);
      result = await termux.runSafe(parts.shift(), parts);
    }
  }

  else if (intent === "cybersecurity") {
    result = {
      mode: "cybersecurity",
      status: "ready",
      scope: "authorized labs, defensive security and legitimate testing",
      capabilities: [
        "Linux/Termux",
        "networking",
        "HTTP/DNS",
        "Nmap concepts",
        "Wireshark analysis",
        "Python/Bash",
        "CTF/lab assistance",
        "vulnerability analysis",
        "secure coding",
        "log analysis"
      ],
      answer:
        "Cybersecurity mode is active. Give JARVIS the exact technical question, error, lab target or code."
    };
  }

  else {
    result = {
      mode: "chat",
      answer:
        "JARVIS core is online. Connect an LLM provider in .env for full natural-language reasoning."
    };
  }

  const response = {
    success: true,
    name: "JARVIS",
    intent,
    plan,
    result,
    timestamp: new Date().toISOString()
  };

  memory.rememberConversation(text, JSON.stringify(response));

  return response;
}

module.exports = { answer };
EOF

cat > jarvis/server.js <<'EOF'
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const config = require("./config/config");
const { answer } = require("./core/brain");
const { videoStatus } = require("./skills/video");
const memory = require("./core/memory");
const { createBackup } = require("./core/backup");

const app = express();

app.use(cors());
app.use(express.json({
  limit: config.maxRequestSize
}));

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: config.name,
    version: config.version,
    status: "online"
  });
});

app.get("/api/jarvis/health", (req, res) => {
  res.json({
    success: true,
    name: "JARVIS",
    status: "online",
    architecture: "Termux user-space",
    rootAccess: false,
    systemPartitionAccess: false,
    providers: config.providers,
    modules: [
      "brain",
      "command-router",
      "memory",
      "backup",
      "cybersecurity",
      "termux",
      "text-to-video",
      "image-to-video",
      "story-to-video",
      "character-animation",
      "voice",
      "image",
      "youtube-analysis",
      "original-remix",
      "device-control"
    ]
  });
});

app.post("/api/jarvis", async (req, res) => {
  try {
    const command = String(req.body.command || "").trim();

    const result = await answer(command, req.body);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/jarvis/video", async (req, res) => {
  try {
    const result = await answer(
      req.body.prompt || "create video",
      req.body
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/jarvis/video/:jobId", async (req, res) => {
  try {
    const result = await videoStatus(req.params.jobId);

    res.json({
      success: true,
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

app.post("/api/jarvis/youtube/analyze", async (req, res) => {
  try {
    const result = await answer(
      "analyze youtube video",
      {
        url: req.body.url
      }
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/jarvis/memory", (req, res) => {
  res.json({
    success: true,
    recent: memory.getRecent(20),
    facts: memory.getFacts(),
    preferences: memory.getPreferences()
  });
});

app.post("/api/jarvis/backup", async (req, res) => {
  try {
    res.json(await createBackup());
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(config.port, config.host, () => {
  console.log("");
  console.log("==============================================");
  console.log("              JARVIS ONLINE");
  console.log("==============================================");
  console.log(`Local API: http://${config.host}:${config.port}`);
  console.log("Root access: DISABLED");
  console.log("System partition: PROTECTED");
  console.log("Termux user-space mode: ENABLED");
  console.log("==============================================");
});
EOF

cat > jarvis.sh <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash

cd "$HOME/animation-ai"

case "$1" in
  start)
    node jarvis/server.js
    ;;
  backup)
    curl -s -X POST http://127.0.0.1:3010/api/jarvis/backup
    echo
    ;;
  health)
    curl -s http://127.0.0.1:3010/api/jarvis/health
    echo
    ;;
  ask)
    shift
    TEXT="$*"

    curl -s -X POST http://127.0.0.1:3010/api/jarvis \
      -H "Content-Type: application/json" \
      -d "$(node -e 'console.log(JSON.stringify({command:process.argv[1]}))' "$TEXT")"

    echo
    ;;
  *)
    echo "JARVIS commands:"
    echo "  ./jarvis.sh start"
    echo "  ./jarvis.sh health"
    echo "  ./jarvis.sh ask \"your command\""
    echo "  ./jarvis.sh backup"
    ;;
esac
EOF

chmod +x jarvis.sh

cat > .env.example <<'EOF'
PORT=3000

# Animation providers
WAVESPEED_API_KEY=
FAL_KEY=
HF_TOKEN=

# JARVIS
JARVIS_HOST=127.0.0.1
JARVIS_PORT=3010
JARVIS_MAX_MEMORY=500
JARVIS_MAX_REQUEST=2mb
EOF

# Make sure dependencies needed by the new core exist
npm install express cors dotenv

echo ""
echo "=============================================="
echo "        JARVIS INSTALLATION COMPLETE"
echo "=============================================="
echo ""
echo "Start:"
echo "  ./jarvis.sh start"
echo ""
echo "In another Termux session:"
echo "  ./jarvis.sh health"
echo ""
echo "Ask:"
echo '  ./jarvis.sh ask "JARVIS status batao"'
echo ""
echo "Backup:"
echo "  ./jarvis.sh backup"
echo ""
echo "IMPORTANT:"
echo "  Root/system partition access = OFF"
echo "  Termux user-space = ON"
echo "=============================================="
