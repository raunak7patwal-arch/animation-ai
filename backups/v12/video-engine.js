const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");

const { createScenes } = require("./scene-engine");
const { generateSceneVoices } = require("./voice-engine");
const { generateSceneVisuals } = require("./visual-engine");
const { generateCharacterVisuals } = require("./character-engine");
const { animateCharacterScene } = require("./character-animation");
const { createLayers } = require("./layered-character-engine");
const { animateLayeredScene } = require("./layered-animation");
const { addTransitions } = require("./transition-engine");
const { getCameraMotion } = require("./camera-engine");
const { enhanceFinalVideo } = require("./quality-engine");


const execFileAsync = promisify(execFile);

const OUTPUT_DIR = path.join(__dirname, "output");
const TEMP_DIR = path.join(__dirname, "temp");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

function getVideoSize(frameSize, quality) {

  if (frameSize === "9:16") {
    if (quality === "4K") return { width: 2160, height: 3840 };
    if (quality === "720p") return { width: 720, height: 1280 };
    return { width: 1080, height: 1920 };
  }

  if (frameSize === "1:1") {
    if (quality === "4K") return { width: 2160, height: 2160 };
    if (quality === "720p") return { width: 720, height: 720 };
    return { width: 1080, height: 1080 };
  }

  if (quality === "4K") {
    return { width: 3840, height: 2160 };
  }

  if (quality === "720p") {
    return { width: 1280, height: 720 };
  }

  return { width: 1920, height: 1080 };
}

async function getAudioDuration(audioFile) {

  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    audioFile
  ]);

  const duration = parseFloat(stdout.trim());

  return Number.isFinite(duration)
    ? Math.max(duration, 3)
    : 5;
}

async function createSceneVideo({
  scene,
  visualFile,
  audioFile,
  outputFile,
  width,
  height
}) {

  const duration = await getAudioDuration(audioFile);
  const frames = Math.ceil(duration * 30);

  console.log(
    `🎬 Animating Scene ${scene.number} (${duration.toFixed(1)} sec)`
  );

  const scaleWidth = Math.ceil(width * 1.10);
  const scaleHeight = Math.ceil(height * 1.10);

  const filter =
    `scale=${scaleWidth}:${scaleHeight},` +
    `crop=${width}:${height}:(in_w-${width})/2:(in_h-${height})/2,` +
    `zoompan=z='min(zoom+0.0008,1.10)':d=${frames}:s=${width}x${height}:fps=30`;

  await execFileAsync("ffmpeg", [
    "-y",

    "-loop", "1",
    "-framerate", "30",
    "-i", visualFile,

    "-i", audioFile,

    "-vf", filter,

    "-t", String(duration),

    "-c:v", "libx264",
    "-preset", "veryfast",
    "-pix_fmt", "yuv420p",

    "-c:a", "aac",
    "-b:a", "128k",

    "-shortest",

    outputFile
  ]);

  if (!fs.existsSync(outputFile)) {
    throw new Error(
      `Scene ${scene.number} video creation failed`
    );
  }

  return outputFile;
}
async function mergeVideos(videoFiles, outputFile) {

  const listFile = path.join(
    TEMP_DIR,
    `concat-${Date.now()}.txt`
  );

  const content = videoFiles
    .map(file => `file '${file}'`)
    .join("\n");

  fs.writeFileSync(listFile, content);

  console.log("🔗 Joining animated scenes...");

  await execFileAsync("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", listFile,
    "-c", "copy",
    outputFile
  ]);

  try {
    fs.unlinkSync(listFile);
  } catch (_) {}

  return outputFile;
}

async function generateVideo({
  title = "Animation AI Video",
  prompt,
  duration = "1 minutes",
  quality = "1080p",
  frameSize = "16:9"
}) {

  const projectId = uuidv4();

  console.log("");
  console.log("======================================");
  console.log("🚀 CINEMATIC VIDEO GENERATION STARTED");
  console.log("======================================");

  const { width, height } =
    getVideoSize(frameSize, quality);

  /*
     STEP 1
     SCENES
  */

  console.log("🎭 Step 1/5: Creating scenes...");

  const scenes = createScenes({
    prompt,
    duration
  });

  console.log(`✅ ${scenes.length} scenes ready`);

  /*
     STEP 2
     VISUALS
  */

  console.log("🖼️ Step 2/5: Creating visuals...");

  const visualFiles = await generateSceneVisuals({
    scenes,
    projectId,
    width,
    height
  });

  console.log(`✅ ${visualFiles.length} visuals created`);

  /*
     STEP 3
     CHARACTERS
  */

  console.log("🧍🤖 Step 3/6: Adding cartoon characters...");

  const characterFiles = await generateCharacterVisuals({
    visualFiles,
    projectId,
    width,
    height
  });

  console.log(`✅ ${characterFiles.length} character scenes created`);

  console.log("🎭 V7: Creating independent character layers...");

  const layeredScenes = [];

  for (let i = 0; i < visualFiles.length; i++) {

    const layers = await createLayers({
      backgroundFile: visualFiles[i],
      projectId,
      sceneNumber: scenes[i].number,
      width,
      height
    });

    layeredScenes.push(layers);

    console.log(
      `✅ V7 Layers ready for Scene ${scenes[i].number}`
    );
  }

  console.log(`🎭 V7: ${layeredScenes.length} layered scenes created`);

  /*
     STEP 4
     VOICES
  */

  console.log("🎙️ Step 4/6: Generating voices...");

  const audioFiles =
    await generateSceneVoices({
      scenes,
      projectId
    });

  console.log(`✅ ${audioFiles.length} voices created`);

  /*
     STEP 4
     ANIMATE SCENES
  */

  console.log("🎬 Step 5/6: Animating character scenes...");

  const sceneVideos = [];

  for (let i = 0; i < scenes.length; i++) {

    // 📷 V9 SMART CAMERA
    getCameraMotion(scenes[i].number);

    const sceneVideo = path.join(
      TEMP_DIR,
      `${projectId}-animated-${i + 1}.mp4`
    );

    await animateLayeredScene({
      backgroundFile: layeredScenes[i].backgroundFile,
      boyFile: layeredScenes[i].boyFile,
      robotFile: layeredScenes[i].robotFile,
      audioFile: audioFiles[i],
      outputFile: sceneVideo,
      sceneNumber: scenes[i].number,
      width,
      height
    });

    sceneVideos.push(sceneVideo);

    console.log(
      `✅ Animated Scene ${i + 1}/${scenes.length}`
    );
  }

  /*
     STEP 5
     FINAL VIDEO
  */

  console.log("🎞️ Step 6/6: Creating final video...");

  const finalVideo = path.join(
    OUTPUT_DIR,
    `${projectId}.mp4`
  );

  // 🎬 V8 CINEMATIC SCENE PIPELINE
  const v8Video = path.join(
    TEMP_DIR,
    `${projectId}-v8-cinematic.mp4`
  );

  console.log("🎬 V8: Processing cinematic scene sequence...");

  await addTransitions({
    inputFiles: sceneVideos,
    outputFile: v8Video,
    width,
    height
  });

  // ✨ V10 FINAL QUALITY
  console.log("✨ V10: Processing final video quality...");

  await enhanceFinalVideo({
    inputFile: v8Video,
    outputFile: finalVideo
  });

  /*
     CLEAN TEMP FILES
  */

  for (const file of sceneVideos) {
    try {
      fs.unlinkSync(file);
    } catch (_) {}
  }

  console.log("");
  console.log("======================================");
  console.log("🎉 CINEMATIC VIDEO COMPLETED");
  console.log("======================================");
  console.log("📁", finalVideo);

  return {
    id: projectId,
    title,
    prompt,
    duration,
    quality,
    frameSize,
    scenes: scenes.length,
    visuals: visualFiles.map(file =>
      `/images/${path.basename(file)}`
    ),
    characters: characterFiles.map(file =>
      `/images/${path.basename(file)}`
    ),
    audioFiles: audioFiles.map(file =>
      `/audio/${path.basename(file)}`
    ),
    videoFile:
      `/output/${path.basename(finalVideo)}`,
    status: "completed",
    createdAt: new Date().toISOString()
  };
}

module.exports = {
  generateVideo
};
