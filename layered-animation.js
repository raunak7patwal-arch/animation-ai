const fs = require("fs");
const { execFile } = require("child_process");
const { promisify } = require("util");


const execFileAsync = promisify(execFile);

/* ============================================================
   REAL HARDWARE FAST ENCODER V2
   Android MediaCodec -> automatic software fallback
   ============================================================ */
async function hasEncoder(name) {
  try {
    const r = await execFileAsync("ffmpeg", [
      "-hide_banner",
      "-encoders"
    ]);
    return String(r.stdout || "").includes(name);
  } catch (_) {
    return false;
  }
}

async function selectEncoder() {
  if (
    process.platform === "android" &&
    await hasEncoder("h264_mediacodec")
  ) {
    return "h264_mediacodec";
  }

  return "libx264";
}

function buildFastArgs({
  encoder,
  backgroundFile,
  boyFile,
  robotFile,
  audioFile,
  filter,
  duration,
  outputFile,
  width,
  height
}) {
  const args = [
    "-y",
    "-hide_banner",
    "-loglevel", "error",

    "-loop", "1",
    "-framerate", "24",
    "-i", backgroundFile,

    "-loop", "1",
    "-framerate", "24",
    "-i", boyFile,

    "-loop", "1",
    "-framerate", "24",
    "-i", robotFile,

    "-stream_loop", "-1",
    "-i", audioFile,

    "-filter_complex", filter,

    "-map", "[v]",
    "-map", "3:a",
    "-t", String(duration),

    "-c:v", encoder
  ];

  if (encoder === "h264_mediacodec") {
    const bitrate =
      width >= 3840 ? "18M" :
      width >= 2560 ? "12M" :
      "8M";

    args.push(
      "-b:v", bitrate,
      "-maxrate", bitrate,
      "-bufsize", bitrate
    );
  } else {
    args.push(
      "-preset", "ultrafast",
      "-crf", "30",
      "-pix_fmt", "yuv420p",
      "-threads", "0"
    );
  }

  args.push(
    "-c:a", "aac",
    "-b:a", "96k",
    "-movflags", "+faststart",
    outputFile
  );

  return args;
}

/* ============================================================
   HARDWARE FIRST — NEVER BREAK GENERATION
   If MediaCodec fails, automatically retry with libx264.
   ============================================================ */
async function runFastEncode(options) {
  const preferred = await selectEncoder();

  console.log(
    `⚡ FAST ENCODER: ${preferred} | ` +
    `${options.width}x${options.height} | 24fps`
  );

  try {
    await execFileAsync(
      "ffmpeg",
      buildFastArgs({
        ...options,
        encoder: preferred
      })
    );

    return preferred;
  } catch (hardwareError) {

    if (preferred !== "h264_mediacodec") {
      throw hardwareError;
    }

    console.log(
      "⚠️ MediaCodec failed — automatic software fallback"
    );

    await execFileAsync(
      "ffmpeg",
      buildFastArgs({
        ...options,
        encoder: "libx264"
      })
    );

    return "libx264";
  }
}


function getMovement(sceneNumber) {
  const movements = [
    { name: "BOY WALK + ROBOT BOB" },
    { name: "BOY SURPRISED + ROBOT SHAKE" },
    { name: "FUNNY DANCE" },
    { name: "SCARED RUN" },
    { name: "THINKING" },
    { name: "ACTION" },
    { name: "CELEBRATION" }
  ];

  return movements[(sceneNumber - 1) % movements.length];
}

async function animateLayeredScene({
  backgroundFile,
  boyFile,
  robotFile,
  audioFile,
  outputFile,
  sceneNumber,
  width,
  height,
  sceneDuration = 5
}) {

  const move = getMovement(sceneNumber);
  const duration = Math.max(1, Number(sceneDuration) || 5);

  console.log(`🎬 V7 Scene ${sceneNumber}: ${move.name}`);
  console.log(`⏱️ Forced duration: ${duration} seconds`);

  const filter =
    `[0:v]scale=${width}:${height},setsar=1[bg];` +
    `[1:v]scale=${width}:${height},format=rgba[boy];` +
    `[2:v]scale=${width}:${height},format=rgba[robot];` +
    `[bg][boy]overlay=0:0:shortest=0[tmp];` +
    `[tmp][robot]overlay=0:0:shortest=0,` +
    `fps=24,trim=duration=${duration},setpts=PTS-STARTPTS[v]`;

  await runFastEncode({
    backgroundFile,
    boyFile,
    robotFile,
    audioFile,
    filter,
    duration,
    outputFile,
    width,
    height
  });


  if (!fs.existsSync(outputFile)) {
    throw new Error(
      `V7 Scene ${sceneNumber} animation failed`
    );
  }

  console.log(
    `✅ V7 Scene ${sceneNumber} completed (${duration}s)`
  );

  return outputFile;
}

module.exports = {
  animateLayeredScene
};
