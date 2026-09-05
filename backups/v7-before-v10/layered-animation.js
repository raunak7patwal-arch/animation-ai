const fs = require("fs");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

function getMovement(sceneNumber) {
  const movements = {
    1: {
      name: "BOY WALK + ROBOT BOB",
      boyX: "sin(t*0.7)*35",
      boyY: "0",
      robotX: "0",
      robotY: "sin(t*2)*12"
    },
    2: {
      name: "BOY SURPRISED + ROBOT SHAKE",
      boyX: "sin(t*6)*8",
      boyY: "sin(t*3)*6",
      robotX: "sin(t*10)*18",
      robotY: "0"
    },
    3: {
      name: "FUNNY DANCE",
      boyX: "sin(t*3)*25",
      boyY: "abs(sin(t*4))*20",
      robotX: "sin(t*4)*30",
      robotY: "abs(sin(t*5))*25"
    },
    4: {
      name: "SCARED RUN",
      boyX: "sin(t*12)*18",
      boyY: "sin(t*8)*10",
      robotX: "sin(t*14)*22",
      robotY: "sin(t*10)*12"
    },
    5: {
      name: "THINKING",
      boyX: "sin(t*0.8)*6",
      boyY: "0",
      robotX: "sin(t*1.2)*10",
      robotY: "sin(t*2)*5"
    },
    6: {
      name: "ACTION",
      boyX: "sin(t*5)*35",
      boyY: "abs(sin(t*5))*18",
      robotX: "sin(t*6)*40",
      robotY: "abs(sin(t*6))*25"
    },
    7: {
      name: "CELEBRATION",
      boyX: "sin(t*4)*30",
      boyY: "abs(sin(t*6))*30",
      robotX: "sin(t*5)*35",
      robotY: "abs(sin(t*7))*35"
    }
  };

  return movements[sceneNumber] || movements[1];
}

async function animateLayeredScene({
  backgroundFile,
  boyFile,
  robotFile,
  audioFile,
  outputFile,
  sceneNumber,
  width,
  height
}) {

  const move = getMovement(sceneNumber);

  console.log(`🎬 V7 Scene ${sceneNumber}: ${move.name}`);

  /*
   Background + independent boy + independent robot
  */

  const filter =
    `[0:v]scale=${width}:${height}[bg];` +

    `[1:v]setpts=PTS-STARTPTS,` +
    `format=rgba,` +
    `overlay=x='${move.boyX}':y='${move.boyY}'[boy];`;

  /*
   Use overlay filter with independently moving layers.
   The transparent PNG layers are full-screen,
   so movement happens through overlay coordinates.
  */

  const complexFilter =
    `[0:v]scale=${width}:${height}[bg];` +

    `[1:v]format=rgba[boy];` +

    `[2:v]format=rgba[robot];` +

    `[bg][boy]overlay=` +
    `x='${move.boyX}':` +
    `y='${move.boyY}':` +
    `eval=frame[tmp];` +

    `[tmp][robot]overlay=` +
    `x='${move.robotX}':` +
    `y='${move.robotY}':` +
    `eval=frame,` +

    `fps=30[v]`;

  await execFileAsync("ffmpeg", [
    "-y",

    "-loop", "1",
    "-framerate", "30",
    "-i", backgroundFile,

    "-loop", "1",
    "-framerate", "30",
    "-i", boyFile,

    "-loop", "1",
    "-framerate", "30",
    "-i", robotFile,

    "-i", audioFile,

    "-filter_complex", complexFilter,

    "-map", "[v]",
    "-map", "3:a",

    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",

    "-pix_fmt", "yuv420p",

    "-c:a", "aac",
    "-b:a", "128k",

    "-shortest",

    outputFile
  ]);

  if (!fs.existsSync(outputFile)) {
    throw new Error(
      `❌ V7 animation failed for Scene ${sceneNumber}`
    );
  }

  console.log(`✅ V7 Scene ${sceneNumber} completed`);

  return outputFile;
}

module.exports = {
  animateLayeredScene
};
