const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");
const { InferenceClient } = require("@huggingface/inference");

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

function getAspectRatio(width, height) {
  if (height > width) return "portrait composition, vertical 9:16";
  if (width === height) return "square composition, 1:1";
  return "widescreen cinematic composition, horizontal 16:9";
}

function buildPrompt(scene, width, height) {
  const description =
    scene.visualPrompt ||
    scene.description ||
    scene.text ||
    "";

  return `
High quality cinematic 3D animated movie scene.
${getAspectRatio(width, height)}.
Scene: ${description}
Colorful professional animation, expressive characters,
detailed environment, cinematic lighting, consistent visual style,
clean composition, no text, no subtitles, no watermark.
`;
}

async function createFallbackVisual({
  scene,
  projectId,
  width,
  height
}) {
  const imageFile = path.join(
    IMAGE_DIR,
    `${projectId}-scene-${scene.number}-fallback.png`
  );

  const title = escapeDrawText(scene.title || `Scene ${scene.number}`);
  const description = escapeDrawText(
    scene.visualPrompt ||
    scene.description ||
    scene.text ||
    ""
  );

  const fontSize = Math.max(32, Math.floor(width / 22));
  const smallFont = Math.max(20, Math.floor(width / 45));

  console.log(`⚠️ Creating fallback visual for Scene ${scene.number}`);

  await execFileAsync("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i",
    `color=c=0x16213e:s=${width}x${height}`,
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

  return imageFile;
}

async function createSceneVisual({
  scene,
  projectId,
  width,
  height
}) {
  const imageFile = path.join(
    IMAGE_DIR,
    `${projectId}-scene-${scene.number}.jpg`
  );

  try {
    if (!process.env.HF_TOKEN) {
      throw new Error("HF_TOKEN is missing");
    }

    console.log(`🤖 AI generating Scene ${scene.number}...`);

    const client = new InferenceClient(process.env.HF_TOKEN);

    const imageBlob = await client.textToImage({
      provider: "hf-inference",
      model: "stabilityai/stable-diffusion-3-medium-diffusers",
      inputs: buildPrompt(scene, width, height)
    });

    const buffer = Buffer.from(await imageBlob.arrayBuffer());

    if (buffer.length < 1000) {
      throw new Error(`Invalid AI image response: ${buffer.length} bytes`);
    }

    fs.writeFileSync(imageFile, buffer);

    console.log(
      `✅ AI Scene ${scene.number} created (${buffer.length} bytes)`
    );

    return imageFile;

  } catch (error) {

    console.error(
      `⚠️ AI generation failed for Scene ${scene.number}:`,
      error.message
    );
    console.error("🔍 Full error:", error);
    console.error("🔍 Cause:", error.cause);

    return await createFallbackVisual({
      scene,
      projectId,
      width,
      height
    });
  }
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
