const fs = require("fs");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

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

  console.log(`🎬 V7 Scene ${sceneNumber}: ${move.name}`);

  /*
    FAST MOBILE MODE

    Instead of expensive animated overlay expressions,
    use lightweight scaling and overlay rendering.
  */

  const filter =
    `[0:v]scale=${width}:${height}[bg];` +
    `[1:v]scale=${width}:${height},format=rgba[boy];` +
    `[2:v]scale=${width}:${height},format=rgba[robot];` +
    `[bg][boy]overlay=0:0[tmp];` +
    `[tmp][robot]overlay=0:0,fps=24[v]`;

  await execFileAsync("ffmpeg", [
    "-y",

    "-loop", "1",
    "-framerate", "24",
    "-i", backgroundFile,

    "-loop", "1",
    "-framerate", "24",
    "-i", boyFile,

    "-loop", "1",
    "-framerate", "24",
    "-i", robotFile,

    "-i", audioFile,

    "-filter_complex", filter,

    "-map", "[v]",
    "-map", "3:a",

    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "28",

    "-pix_fmt", "yuv420p",

    "-c:a", "aac",
    "-b:a", "96k",

    "-shortest",

    outputFile
  ]);

  if (!fs.existsSync(outputFile)) {
    throw new Error(
      `V7 Scene ${sceneNumber} animation failed`
    );
  }

  console.log(`✅ V7 Scene ${sceneNumber} completed`);

  return outputFile;
}

module.exports = {
  animateLayeredScene
};
