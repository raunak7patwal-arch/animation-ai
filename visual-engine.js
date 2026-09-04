const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const IMAGE_DIR = path.join(__dirname, "images");
fs.mkdirSync(IMAGE_DIR, { recursive: true });

function escapeDrawText(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/,/g, "\\,")
    .replace(/\n/g, " ");
}

function getVisualStyle(sceneNumber) {
  const styles = [
    {
      background: "0x16213e",
      mood: "cinematic school morning"
    },
    {
      background: "0x3d0c11",
      mood: "funny problem and chaos"
    },
    {
      background: "0x1b4332",
      mood: "mysterious discovery"
    },
    {
      background: "0x5f0f40",
      mood: "fast funny chaos"
    },
    {
      background: "0x003049",
      mood: "crazy plan"
    },
    {
      background: "0x540b0e",
      mood: "dramatic twist"
    },
    {
      background: "0x264653",
      mood: "happy funny ending"
    }
  ];

  return styles[(sceneNumber - 1) % styles.length];
}

async function createSceneVisual({
  scene,
  projectId,
  width,
  height
}) {
  const style = getVisualStyle(scene.number);

  const imageFile = path.join(
    IMAGE_DIR,
    `${projectId}-scene-${scene.number}.png`
  );

  const title = escapeDrawText(scene.title);
  const description = escapeDrawText(
    scene.visualPrompt || scene.text || ""
  );

  const fontSize = Math.max(32, Math.floor(width / 22));
  const smallFont = Math.max(20, Math.floor(width / 45));

  console.log(
    `🖼️ Creating visual for Scene ${scene.number}: ${style.mood}`
  );

  await execFileAsync("ffmpeg", [
    "-y",

    "-f", "lavfi",
    "-i",
    `color=c=${style.background}:s=${width}x${height}`,

    "-frames:v",
    "1",

    "-vf",
    [
      `drawbox=x=0:y=0:w=iw:h=ih:color=black@0.20:t=fill`,
      `drawbox=x=80:y=80:w=iw-160:h=ih-160:color=white@0.08:t=fill`,
      `drawtext=text='${title}':fontcolor=white:fontsize=${fontSize}:x=(w-text_w)/2:y=h*0.40`,
      `drawtext=text='${description}':fontcolor=white@0.80:fontsize=${smallFont}:x=(w-text_w)/2:y=h*0.55`
    ].join(","),

    imageFile
  ]);

  if (!fs.existsSync(imageFile)) {
    throw new Error(
      `Visual image was not created for scene ${scene.number}`
    );
  }

  return imageFile;
}

async function generateSceneVisuals({
  scenes,
  projectId,
  width,
  height
}) {
  const visuals = [];

  for (const scene of scenes) {
    const file = await createSceneVisual({
      scene,
      projectId,
      width,
      height
    });

    visuals.push(file);
  }

  return visuals;
}

module.exports = {
  createSceneVisual,
  generateSceneVisuals
};
