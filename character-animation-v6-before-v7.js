const fs = require("fs");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

/*
========================================
🎭 CHARACTER ANIMATION ENGINE V6
========================================
Different movement for every scene
========================================
*/

function getSceneMotion(sceneNumber, width, height) {

  const motions = {
    1: {
      name: "NORMAL WALK",
      zoom: 1.05,
      x: "sin(t*0.7)*10",
      y: "cos(t*1.2)*3"
    },

    2: {
      name: "SURPRISED SHAKE",
      zoom: 1.07,
      x: "sin(t*8)*18",
      y: "cos(t*6)*5"
    },

    3: {
      name: "FUNNY BOUNCE",
      zoom: 1.06,
      x: "sin(t*2)*12",
      y: "abs(sin(t*4))*18"
    },

    4: {
      name: "SCARED SHAKE",
      zoom: 1.08,
      x: "sin(t*12)*22",
      y: "cos(t*10)*8"
    },

    5: {
      name: "THINKING MOVE",
      zoom: 1.10,
      x: "sin(t*0.8)*8",
      y: "cos(t*1.5)*4"
    },

    6: {
      name: "ACTION FAST",
      zoom: 1.12,
      x: "sin(t*4)*25",
      y: "cos(t*3)*10"
    },

    7: {
      name: "CELEBRATION BOUNCE",
      zoom: 1.10,
      x: "sin(t*3)*15",
      y: "abs(sin(t*5))*22"
    }
  };

  return motions[sceneNumber] || motions[1];
}


async function animateCharacterScene({
  inputFile,
  audioFile,
  outputFile,
  sceneNumber,
  width,
  height
}) {

  const motion = getSceneMotion(
    sceneNumber,
    width,
    height
  );

  console.log(
    `🎭 Scene ${sceneNumber}: ${motion.name}`
  );

  console.log(
    `🎬 Animating character movement...`
  );

  const scaleWidth = Math.ceil(
    width * motion.zoom
  );

  const scaleHeight = Math.ceil(
    height * motion.zoom
  );

  /*
  ========================================
  Cinematic movement filter
  ========================================
  */

  const filter =
    `scale=${scaleWidth}:${scaleHeight},` +

    `crop=${width}:${height}:` +

    `x='(in_w-${width})/2+${motion.x}':` +

    `y='(in_h-${height})/2+${motion.y}',` +

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

    "-crf", "23",

    "-pix_fmt", "yuv420p",

    "-c:a", "aac",

    "-b:a", "128k",

    "-shortest",

    outputFile
  ]);

  if (!fs.existsSync(outputFile)) {

    throw new Error(
      `❌ Animation failed for Scene ${sceneNumber}`
    );

  }

  console.log(
    `✅ Scene ${sceneNumber} animation completed`
  );

  return outputFile;
}


module.exports = {
  animateCharacterScene
};
