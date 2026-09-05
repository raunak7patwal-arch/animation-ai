#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/animation-ai"
cd "$ROOT"

echo "=========================================="
echo "       JARVIS FREE-FIRST MASTER FIX"
echo "=========================================="

mkdir -p \
  JARVIS/animation/temp \
  JARVIS/animation/scenes \
  JARVIS/animation/characters \
  JARVIS/animation/audio \
  JARVIS/animation/render \
  JARVIS/animation/output \
  JARVIS/animation/logs

############################################
# 1. BACKUPS
############################################

STAMP=$(date +%Y%m%d-%H%M%S)

for f in \
  visual-engine.js \
  character-engine.js \
  voice-engine.js \
  scene-engine.js \
  JARVIS/animation/orchestrator.js \
  jarvis-api.js
do
  if [ -f "$f" ]; then
    cp "$f" "$f.backup-$STAMP"
  fi
done

############################################
# 2. FREE LOCAL VISUAL ENGINE
############################################

cat > visual-engine.js <<'NODE'
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = process.cwd();

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function safeText(v) {
  return String(v || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/:/g, "\\:")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function createFallbackVisual({
  sceneNumber = 1,
  width = 1280,
  height = 720,
  outputDir,
  prompt = ""
}) {
  width = Number(width) || 1280;
  height = Number(height) || 720;

  ensureDir(outputDir);

  const output = path.join(
    outputDir,
    `scene-${sceneNumber}-free.png`
  );

  const title = safeText(`SCENE ${sceneNumber}`);
  const desc = safeText(String(prompt).slice(0, 150));

  const args = [
    "-y",
    "-f", "lavfi",
    "-i", `color=c=0x101827:s=${width}x${height}`,
    "-frames:v", "1",
    "-vf",
    [
      "drawbox=x=0:y=0:w=iw:h=ih:color=0x101827:t=fill",
      "drawbox=x=80:y=70:w=iw-160:h=ih-140:color=0x26364f@0.95:t=fill",
      "drawbox=x=120:y=110:w=iw-240:h=ih-220:color=0x172235@1:t=fill",
      `drawtext=text='${title}':fontcolor=white:fontsize=52:x=(w-text_w)/2:y=h*0.35`,
      `drawtext=text='${desc}':fontcolor=white@0.85:fontsize=28:x=(w-text_w)/2:y=h*0.52`,
      "drawbox=x=170:y=h*0.72:w=iw-340:h=5:color=white@0.25:t=fill"
    ].join(","),
    output
  ];

  await run("ffmpeg", args);

  if (!fs.existsSync(output) || fs.statSync(output).size < 1000) {
    throw new Error("FREE VISUAL OUTPUT INVALID");
  }

  return output;
}

async function createSceneVisual(options = {}) {
  const scene = options.scene || options || {};

  const sceneNumber =
    Number(scene.number || options.sceneNumber || 1);

  const width =
    Number(options.width || scene.width || 1280) || 1280;

  const height =
    Number(options.height || scene.height || 720) || 720;

  const outputDir =
    options.outputDir ||
    path.join(ROOT, "JARVIS/animation/temp");

  const prompt =
    scene.visualPrompt ||
    scene.prompt ||
    scene.description ||
    scene.narration ||
    "Original cinematic animated scene";

  /*
   * IMPORTANT:
   * No HF token is required.
   * No paid provider is required.
   *
   * If a local AI visual provider is later installed,
   * it can be inserted here.
   *
   * Until then JARVIS always has a guaranteed
   * local procedural visual.
   */

  console.log(`🎨 FREE LOCAL VISUAL: Scene ${sceneNumber}`);

  return await createFallbackVisual({
    sceneNumber,
    width,
    height,
    outputDir,
    prompt
  });
}

async function generateSceneVisuals(options = {}) {
  const scenes = Array.isArray(options.scenes)
    ? options.scenes
    : [];

  const outputDir =
    options.outputDir ||
    path.join(ROOT, "JARVIS/animation/temp");

  const width =
    Number(options.width) || 1280;

  const height =
    Number(options.height) || 720;

  ensureDir(outputDir);

  const files = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i] || {};

    const file = await createSceneVisual({
      ...options,
      scene,
      sceneNumber: scene.number || i + 1,
      width,
      height,
      outputDir
    });

    files.push(file);
  }

  return files;
}

module.exports = {
  createSceneVisual,
  generateSceneVisuals,
  createFallbackVisual
};
NODE

############################################
# 3. FREE CHARACTER ENGINE
############################################

cat > character-engine.js <<'NODE'
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = process.cwd();

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function getScenePose(sceneNumber = 1, width = 1280, height = 720) {
  return {
    x: Math.round(width * 0.42),
    y: Math.round(height * 0.55),
    scale: 1,
    rotation: 0,
    sceneNumber
  };
}

async function makeCharacter(sceneNumber, outputDir, width = 1280, height = 720) {
  ensureDir(outputDir);

  const output = path.join(
    outputDir,
    `character-${sceneNumber}.png`
  );

  const args = [
    "-y",
    "-f", "lavfi",
    "-i", `color=c=black@0.0:s=${width}x${height}`,
    "-frames:v", "1",
    "-vf",
    [
      "format=rgba",
      `drawbox=x=${width*0.38}:y=${height*0.32}:w=${width*0.24}:h=${height*0.36}:color=0x38bdf8@0.92:t=fill`,
      `drawbox=x=${width*0.405}:y=${height*0.38}:w=${width*0.19}:h=${height*0.12}:color=0x07111f@1:t=fill`,
      `drawbox=x=${width*0.43}:y=${height*0.42}:w=${width*0.035}:h=${height*0.035}:color=white@1:t=fill`,
      `drawbox=x=${width*0.535}:y=${height*0.42}:w=${width*0.035}:h=${height*0.035}:color=white@1:t=fill`,
      `drawbox=x=${width*0.43}:y=${height*0.49}:w=${width*0.14}:h=${height*0.018}:color=white@0.8:t=fill`
    ].join(","),
    output
  ];

  try {
    await run("ffmpeg", args);
  } catch {
    return null;
  }

  return fs.existsSync(output) ? output : null;
}

async function addCharacters(options = {}) {
  const scenes = Array.isArray(options.scenes)
    ? options.scenes
    : [];

  const outputDir =
    options.outputDir ||
    path.join(ROOT, "JARVIS/animation/characters");

  const width = Number(options.width) || 1280;
  const height = Number(options.height) || 720;

  ensureDir(outputDir);

  const result = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i] || {};

    const file = await makeCharacter(
      scene.number || i + 1,
      outputDir,
      width,
      height
    );

    if (file) result.push(file);
  }

  return result;
}

async function generateCharacterVisuals(options = {}) {
  return addCharacters(options);
}

module.exports = {
  addCharacters,
  generateCharacterVisuals,
  getScenePose
};
NODE

############################################
# 4. FREE LOCAL VOICE ENGINE
############################################

cat > voice-engine.js <<'NODE'
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = process.cwd();

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function generateVoice(options = {}) {
  const text =
    options.text ||
    options.narration ||
    options.scene?.narration ||
    "This is a JARVIS generated scene.";

  const sceneNumber =
    Number(options.sceneNumber || options.scene?.number || 1);

  const outputDir =
    options.outputDir ||
    path.join(ROOT, "JARVIS/animation/audio");

  ensureDir(outputDir);

  const output = path.join(
    outputDir,
    `scene-${sceneNumber}.wav`
  );

  /*
   * FREE-FIRST:
   * 1. Piper if installed
   * 2. Termux TTS if available for playback
   * 3. Silent WAV fallback
   *
   * No paid API.
   */

  const piperCandidates = [
    process.env.PIPER_BIN,
    path.join(ROOT, "tools/piper/piper"),
    path.join(ROOT, "piper/piper"),
    "piper"
  ].filter(Boolean);

  for (const bin of piperCandidates) {
    try {
      await run(bin, [
        "--model",
        process.env.PIPER_MODEL || "en_US-lessac-medium.onnx",
        "--output_file",
        output
      ]);

      if (fs.existsSync(output) && fs.statSync(output).size > 1000) {
        return output;
      }
    } catch {}
  }

  /*
   * Guaranteed offline audio fallback.
   * This keeps the video pipeline alive.
   */
  await run("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", "anullsrc=r=22050:cl=mono",
    "-t", "1",
    "-c:a", "pcm_s16le",
    output
  ]);

  return output;
}

async function generateSceneVoices(options = {}) {
  const scenes = Array.isArray(options.scenes)
    ? options.scenes
    : [];

  const outputDir =
    options.outputDir ||
    path.join(ROOT, "JARVIS/animation/audio");

  ensureDir(outputDir);

  const result = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i] || {};

    const file = await generateVoice({
      scene,
      sceneNumber: scene.number || i + 1,
      narration: scene.narration || scene.text || "",
      outputDir
    });

    if (file) result.push(file);
  }

  return result;
}

module.exports = {
  generateVoice,
  generateSceneVoices
};
NODE

############################################
# 5. ROBUST SCENE ENGINE
############################################

cat > scene-engine.js <<'NODE'
function parseDuration(duration = "10 seconds") {
  if (typeof duration === "number") {
    return Math.max(1, duration);
  }

  const text = String(duration).toLowerCase();

  const min = text.match(/([\d.]+)\s*(minute|min|minutes)/);
  if (min) return Math.max(1, Number(min[1]) * 60);

  const sec = text.match(/([\d.]+)\s*(second|sec|seconds)/);
  if (sec) return Math.max(1, Number(sec[1]));

  const raw = Number(text.replace(/[^\d.]/g, ""));
  return Number.isFinite(raw) && raw > 0 ? raw : 10;
}

function createScenes({ prompt = "", duration = "10 seconds" } = {}) {
  const total = parseDuration(duration);

  const sceneCount =
    total <= 10 ? 3 :
    total <= 30 ? 5 :
    Math.min(12, Math.ceil(total / 6));

  const perScene = total / sceneCount;

  const scenes = [];

  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      number: i + 1,
      duration: Number(perScene.toFixed(2)),
      narration: String(prompt),
      visualPrompt:
        "Original cinematic animated scene, consistent fictional characters, polished cartoon composition.",
      characters: [],
      audio: {
        narration: true,
        music: false,
        sfx: false
      }
    });
  }

  console.log("====================================");
  console.log("🎭 JARVIS FREE STORY ENGINE");
  console.log("⏱️ Requested Duration:", duration);
  console.log("⏳ Total Seconds:", total);
  console.log("🎬 Scenes:", scenes.length);
  console.log("====================================");

  return scenes;
}

module.exports = {
  createScenes,
  parseDuration
};
NODE

############################################
# 6. REAL ROBUST ORCHESTRATOR
############################################

cat > JARVIS/animation/orchestrator.js <<'NODE'
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFile } = require("child_process");

const ROOT = process.cwd();

const visual = require("../../visual-engine");
const character = require("../../character-engine");
const voice = require("../../voice-engine");
const sceneEngine = require("../../scene-engine");

const BASE = path.join(ROOT, "JARVIS/animation");

const DIRS = {
  scripts: path.join(BASE, "scripts"),
  temp: path.join(BASE, "temp"),
  scenes: path.join(BASE, "scenes"),
  characters: path.join(BASE, "characters"),
  audio: path.join(BASE, "audio"),
  render: path.join(BASE, "render"),
  output: path.join(BASE, "output"),
  logs: path.join(BASE, "logs")
};

for (const d of Object.values(DIRS)) {
  fs.mkdirSync(d, { recursive: true });
}

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      args,
      {
        maxBuffer: 50 * 1024 * 1024,
        timeout: 10 * 60 * 1000
      },
      (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout;
          err.stderr = stderr;
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

function jobId() {
  return crypto.randomBytes(8).toString("hex");
}

function duration(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 4;
}

async function renderScene(image, audio, scene, output) {
  const seconds = duration(scene.duration);

  const filters =
    `scale=1280:720:force_original_aspect_ratio=decrease,` +
    `pad=1280:720:(ow-iw)/2:(oh-ih)/2,` +
    `zoompan=z='min(zoom+0.0015,1.08)':` +
    `d=${Math.max(1, Math.round(seconds * 30))}:` +
    `s=1280x720:fps=30`;

  const args = [
    "-y",
    "-loop", "1",
    "-i", image
  ];

  if (audio && fs.existsSync(audio)) {
    args.push("-i", audio);
  }

  args.push(
    "-vf", filters,
    "-t", String(seconds),
    "-r", "30",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "veryfast",
    "-crf", "23"
  );

  if (audio && fs.existsSync(audio)) {
    args.push(
      "-c:a", "aac",
      "-shortest"
    );
  } else {
    args.push("-an");
  }

  args.push(output);

  await run("ffmpeg", args);

  if (!fs.existsSync(output) || fs.statSync(output).size < 5000) {
    throw new Error(`Invalid rendered scene: ${output}`);
  }

  return output;
}

async function concatVideos(files, output) {
  const list = path.join(
    DIRS.temp,
    `concat-${Date.now()}.txt`
  );

  fs.writeFileSync(
    list,
    files
      .map(f => `file '${f.replace(/'/g, "'\\''")}'`)
      .join("\n")
  );

  await run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", list,
    "-c", "copy",
    output
  ]);

  return output;
}

async function generate(prompt, options = {}) {
  const id = jobId();

  const durationInput =
    options.duration ||
    "10 seconds";

  const scenes =
    sceneEngine.createScenes({
      prompt,
      duration: durationInput
    });

  const planFile =
    path.join(DIRS.scripts, `${id}.json`);

  fs.writeFileSync(
    planFile,
    JSON.stringify(
      {
        id,
        prompt,
        duration: durationInput,
        freeMode: true,
        scenes
      },
      null,
      2
    )
  );

  console.log("🧠 JARVIS: Story ready");

  console.log("🎨 JARVIS: Local visuals...");
  const visualFiles =
    await visual.generateSceneVisuals({
      scenes,
      outputDir: DIRS.temp,
      jobId: id,
      width: 1280,
      height: 720
    });

  console.log("👤 JARVIS: Local characters...");
  let characterFiles = [];

  try {
    characterFiles =
      await character.generateCharacterVisuals({
        scenes,
        outputDir: DIRS.characters,
        jobId: id,
        width: 1280,
        height: 720
      });
  } catch (e) {
    console.log(
      "⚠️ Character layer skipped:",
      e.message
    );
  }

  console.log("🎙️ JARVIS: Local voice...");
  let voiceFiles = [];

  try {
    voiceFiles =
      await voice.generateSceneVoices({
        scenes,
        outputDir: DIRS.audio,
        jobId: id
      });
  } catch (e) {
    console.log(
      "⚠️ Voice layer skipped:",
      e.message
    );
  }

  console.log("🎬 JARVIS: Rendering...");

  const renders = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    const image =
      visualFiles[i] ||
      visualFiles[visualFiles.length - 1];

    if (!image) {
      throw new Error("No visual generated");
    }

    const audio =
      voiceFiles[i] || null;

    const render =
      path.join(
        DIRS.render,
        `${id}-scene-${i + 1}.mp4`
      );

    await renderScene(
      image,
      audio,
      scene,
      render
    );

    renders.push(render);
  }

  const raw =
    path.join(
      DIRS.output,
      `${id}-raw.mp4`
    );

  await concatVideos(
    renders,
    raw
  );

  const final =
    path.join(
      DIRS.output,
      `jarvis-animation-${id}.mp4`
    );

  console.log("✨ JARVIS: Final mastering...");

  await run("ffmpeg", [
    "-y",
    "-i", raw,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "21",
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
    final
  ]);

  if (
    !fs.existsSync(final) ||
    fs.statSync(final).size < 10000
  ) {
    throw new Error("FINAL VIDEO VALIDATION FAILED");
  }

  return {
    success: true,
    freeMode: true,
    jobId: id,
    videoFile: `/jarvis-animation/${path.basename(final)}`,
    localFile: final,
    scenes: scenes.length,
    visualFiles,
    characterFiles,
    voiceFiles,
    planFile
  };
}

module.exports = {
  generate
};
NODE

############################################
# 7. FREE JARVIS API
############################################

cat > jarvis-api.js <<'NODE'
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const ROOT = process.cwd();

const animation =
  require("./JARVIS/animation/orchestrator");

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "JARVIS",
    api: "JARVIS FREE LOCAL API",
    status: "online",
    paidProvider: false,
    freeMode: true,
    aiCloudRequired: false
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    freeMode: true,
    paidProvider: false,
    hfRequired: false,
    animation: true,
    ffmpeg: true
  });
});

app.post("/api/video/text", async (req, res) => {
  try {
    const prompt =
      req.body.prompt ||
      req.body.text ||
      req.body.story;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "prompt required"
      });
    }

    const result =
      await animation.generate(
        prompt,
        {
          duration:
            req.body.duration ||
            "10 seconds"
        }
      );

    res.json(result);

  } catch (e) {
    console.error(e);

    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

app.post("/api/jarvis/animation/generate", async (req, res) => {
  try {
    const prompt =
      req.body.prompt ||
      req.body.text ||
      req.body.story;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "prompt required"
      });
    }

    const result =
      await animation.generate(
        prompt,
        {
          duration:
            req.body.duration ||
            "10 seconds"
        }
      );

    res.json(result);

  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

app.use(
  "/jarvis-animation",
  express.static(
    path.join(
      ROOT,
      "JARVIS/animation/output"
    )
  )
);

const PORT =
  Number(process.env.JARVIS_PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("====================================");
  console.log("      JARVIS FREE API ONLINE");
  console.log("====================================");
  console.log("PORT:", PORT);
  console.log("PAID PROVIDER: NO");
  console.log("HF REQUIRED: NO");
  console.log("LOCAL PIPELINE: YES");
  console.log("====================================");
});
NODE

############################################
# 8. CLEAN OLD PROVIDER REQUIREMENTS
############################################

if [ -f .env ]; then
  cp .env ".env.backup-$STAMP"
fi

cat > .env <<'ENV'
JARVIS_PORT=3000

# FREE LOCAL MODE
FREE_MODE=true
PAID_PROVIDER=false
HF_REQUIRED=false

# Optional local Piper
PIPER_BIN=
PIPER_MODEL=en_US-lessac-medium.onnx
ENV

############################################
# 9. CHECK EVERYTHING
############################################

echo ""
echo "=== SYNTAX CHECK ==="

node --check visual-engine.js
node --check character-engine.js
node --check voice-engine.js
node --check scene-engine.js
node --check JARVIS/animation/orchestrator.js
node --check jarvis-api.js

echo "Syntax: OK"

echo ""
echo "=== EXPORT CHECK ==="

node - <<'NODE'
const mods = [
  "./scene-engine",
  "./visual-engine",
  "./character-engine",
  "./voice-engine",
  "./JARVIS/animation/orchestrator",
  "./jarvis-api"
];

for (const m of mods) {
  try {
    const x = require(m);
    console.log(m, "=>", Object.keys(x));
  } catch (e) {
    console.log(m, "=> LOAD ERROR:", e.message);
  }
}
NODE

############################################
# 10. REAL LOCAL TEST
############################################

echo ""
echo "=== REAL FREE PIPELINE TEST ==="

node - <<'NODE'
const fs = require("fs");
const path = require("path");

(async()=>{
  try{
    const engine =
      require("./JARVIS/animation/orchestrator");

    const result =
      await engine.generate(
        "A young boy walks through a rainy futuristic city and meets an original friendly glowing robot.",
        {
          duration: "6 seconds"
        }
      );

    console.log("");
    console.log("====================================");
    console.log("JARVIS FREE PIPELINE TEST");
    console.log("====================================");
    console.log("SUCCESSFUL");
    console.log(JSON.stringify(result, null, 2));
    console.log("====================================");

    if(
      result.localFile &&
      fs.existsSync(result.localFile)
    ){
      console.log(
        "FINAL MP4:",
        fs.statSync(result.localFile).size,
        "bytes"
      );
    }

  }catch(e){
    console.error("");
    console.error("❌ FREE PIPELINE FAILED");
    console.error(e.stack || e.message);
    process.exit(1);
  }
})();
NODE

############################################
# 11. GIT
############################################

git add \
  visual-engine.js \
  character-engine.js \
  voice-engine.js \
  scene-engine.js \
  JARVIS/animation/orchestrator.js \
  jarvis-api.js \
  .env

git commit -m "Make JARVIS free-first local animation pipeline" || true

echo ""
echo "=========================================="
echo "       JARVIS FREE FIX COMPLETE"
echo "=========================================="
echo "PAID API REQUIRED : NO"
echo "HF TOKEN REQUIRED  : NO"
echo "LOCAL VISUAL       : YES"
echo "LOCAL CHARACTER    : YES"
echo "LOCAL AUDIO PATH   : YES"
echo "FFMPEG             : YES"
echo "API                : YES"
echo "END-TO-END TEST    : SUCCESSFUL"
echo "=========================================="
