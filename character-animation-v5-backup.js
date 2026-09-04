const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

function getMotion(sceneNumber, width, height) {
  const direction = sceneNumber % 2 === 0 ? 1 : -1;

  return {
    boyStartX: Math.floor(width * 0.22),
    boyEndX: Math.floor(width * 0.22) + direction * 80,

    robotStartX: Math.floor(width * 0.72),
    robotEndX: Math.floor(width * 0.72) - direction * 60,

    zoomStart: 1.0,
    zoomEnd: 1.08
  };
}

async function animateCharacterScene({
  inputFile,
  audioFile,
  outputFile,
  sceneNumber,
  width,
  height
}) {
  console.log(`🎭 Animating character movement for Scene ${sceneNumber}`);

  const motion = getMotion(sceneNumber, width, height);

  const filter =
    `scale=${Math.ceil(width * 1.08)}:${Math.ceil(height * 1.08)},` +
    `crop=${width}:${height}:` +
    `x='(in_w-${width})/2+sin(t*0.8)*12':` +
    `y='(in_h-${height})/2+cos(t*0.7)*6',` +
    `fps=30`;

  await execFileAsync("ffmpeg", [
    "-y",
    "-loop", "1",
    "-framerate", "30",
    "-i", inputFile,

    "-i", audioFile,

    "-vf", filter,

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
      `Character animation failed for Scene ${sceneNumber}`
    );
  }

  return outputFile;
}

module.exports = {
  animateCharacterScene
};
