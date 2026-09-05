const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const IMAGE_DIR = path.join(__dirname, "images");
fs.mkdirSync(IMAGE_DIR, { recursive: true });

function getScenePose(sceneNumber, width, height) {
  const groundY = Math.floor(height * 0.78);

  const poses = [
    {
      name: "normal",
      boyX: 0.28,
      robotX: 0.72,
      boyTilt: 0,
      robotTilt: 0
    },
    {
      name: "surprised",
      boyX: 0.32,
      robotX: 0.68,
      boyTilt: -12,
      robotTilt: 8
    },
    {
      name: "funny",
      boyX: 0.25,
      robotX: 0.75,
      boyTilt: 10,
      robotTilt: -10
    },
    {
      name: "scared",
      boyX: 0.38,
      robotX: 0.65,
      boyTilt: -8,
      robotTilt: 12
    },
    {
      name: "thinking",
      boyX: 0.30,
      robotX: 0.70,
      boyTilt: 5,
      robotTilt: -5
    },
    {
      name: "action",
      boyX: 0.42,
      robotX: 0.62,
      boyTilt: -15,
      robotTilt: 15
    },
    {
      name: "celebration",
      boyX: 0.30,
      robotX: 0.70,
      boyTilt: 0,
      robotTilt: 0
    }
  ];

  const pose = poses[(sceneNumber - 1) % poses.length];

  return {
    ...pose,
    groundY,
    boyX: Math.floor(width * pose.boyX),
    robotX: Math.floor(width * pose.robotX)
  };
}

function buildCharacterFilter(sceneNumber, width, height) {
  const p = getScenePose(sceneNumber, width, height);

  const g = p.groundY;
  const bx = p.boyX;
  const rx = p.robotX;

  const filters = [

    // Ground shadow
    `drawbox=x=0:y=${g}:w=${width}:h=${height-g}:color=black@0.25:t=fill`,

    // =====================
    // BOY BODY
    // =====================

    `drawbox=x=${bx-55}:y=${g-210}:w=110:h=170:color=blue@0.92:t=fill`,

    // Head
    `drawbox=x=${bx-65}:y=${g-330}:w=130:h=130:color=yellow@0.97:t=fill`,

    // Hair
    `drawbox=x=${bx-65}:y=${g-330}:w=130:h=28:color=black@0.9:t=fill`,

    // Eyes
    `drawbox=x=${bx-38}:y=${g-285}:w=18:h=18:color=black:t=fill`,
    `drawbox=x=${bx+20}:y=${g-285}:w=18:h=18:color=black:t=fill`,

    // =====================
    // ROBOT
    // =====================

    // Robot head
    `drawbox=x=${rx-85}:y=${g-270}:w=170:h=140:color=gray@0.97:t=fill`,

    // Robot body
    `drawbox=x=${rx-105}:y=${g-130}:w=210:h=120:color=silver@0.97:t=fill`,

    // Robot eyes
    `drawbox=x=${rx-55}:y=${g-225}:w=32:h=30:color=cyan:t=fill`,
    `drawbox=x=${rx+23}:y=${g-225}:w=32:h=30:color=cyan:t=fill`,

    // Antenna
    `drawbox=x=${rx-12}:y=${g-310}:w=24:h=40:color=gray:t=fill`,
    `drawbox=x=${rx-20}:y=${g-330}:w=40:h=20:color=red:t=fill`
  ];

  // =====================
  // SCENE-SPECIFIC POSES
  // =====================

  switch (p.name) {

    case "normal":

      filters.push(
        `drawbox=x=${bx-30}:y=${g-240}:w=60:h=10:color=red:t=fill`,
        `drawbox=x=${bx-95}:y=${g-190}:w=40:h=25:color=yellow:t=fill`,
        `drawbox=x=${bx+55}:y=${g-190}:w=40:h=25:color=yellow:t=fill`,
        `drawbox=x=${rx-40}:y=${g-165}:w=80:h=10:color=black:t=fill`
      );

      break;

    case "surprised":

      filters.push(
        `drawbox=x=${bx-20}:y=${g-235}:w=40:h=28:color=red:t=fill`,
        `drawbox=x=${bx-110}:y=${g-250}:w=45:h=25:color=yellow:t=fill`,
        `drawbox=x=${bx+65}:y=${g-250}:w=45:h=25:color=yellow:t=fill`,
        `drawbox=x=${rx-25}:y=${g-170}:w=50:h=25:color=black:t=fill`
      );

      break;

    case "funny":

      filters.push(
        `drawbox=x=${bx-40}:y=${g-235}:w=80:h=18:color=red:t=fill`,
        `drawbox=x=${bx-115}:y=${g-170}:w=60:h=22:color=yellow:t=fill`,
        `drawbox=x=${rx-60}:y=${g-170}:w=120:h=18:color=black:t=fill`
      );

      break;

    case "scared":

      filters.push(
        `drawbox=x=${bx-18}:y=${g-240}:w=36:h=35:color=black:t=fill`,
        `drawbox=x=${bx-100}:y=${g-230}:w=45:h=25:color=yellow:t=fill`,
        `drawbox=x=${bx+55}:y=${g-230}:w=45:h=25:color=yellow:t=fill`,
        `drawbox=x=${rx-20}:y=${g-170}:w=40:h=35:color=black:t=fill`
      );

      break;

    case "thinking":

      filters.push(
        `drawbox=x=${bx-35}:y=${g-240}:w=55:h=8:color=red:t=fill`,
        `drawbox=x=${bx+55}:y=${g-270}:w=35:h=90:color=yellow:t=fill`,
        `drawbox=x=${rx-40}:y=${g-165}:w=80:h=8:color=black:t=fill`
      );

      break;

    case "action":

      filters.push(
        `drawbox=x=${bx-130}:y=${g-230}:w=75:h=25:color=yellow:t=fill`,
        `drawbox=x=${bx+55}:y=${g-150}:w=90:h=25:color=yellow:t=fill`,
        `drawbox=x=${rx-180}:y=${g-120}:w=75:h=25:color=gray:t=fill`,
        `drawbox=x=${rx+105}:y=${g-120}:w=75:h=25:color=gray:t=fill`
      );

      break;

    case "celebration":

      filters.push(
        `drawbox=x=${bx-100}:y=${g-320}:w=40:h=130:color=yellow:t=fill`,
        `drawbox=x=${bx+60}:y=${g-320}:w=40:h=130:color=yellow:t=fill`,
        `drawbox=x=${bx-40}:y=${g-235}:w=80:h=16:color=red:t=fill`,

        `drawbox=x=${rx-150}:y=${g-260}:w=45:h=130:color=gray:t=fill`,
        `drawbox=x=${rx+105}:y=${g-260}:w=45:h=130:color=gray:t=fill`,
        `drawbox=x=${rx-55}:y=${g-170}:w=110:h=18:color=black:t=fill`
      );

      break;
  }

  // Legs
  filters.push(
    `drawbox=x=${bx-48}:y=${g-40}:w=30:h=40:color=blue:t=fill`,
    `drawbox=x=${bx+18}:y=${g-40}:w=30:h=40:color=blue:t=fill`,

    `drawbox=x=${rx-70}:y=${g-25}:w=35:h=25:color=gray:t=fill`,
    `drawbox=x=${rx+35}:y=${g-25}:w=35:h=25:color=gray:t=fill`,

    // Ground line
    `drawbox=x=0:y=${g-3}:w=${width}:h=6:color=white@0.4:t=fill`
  );

  return filters.join(",");
}

async function addCharacters({
  inputFile,
  outputFile,
  sceneNumber,
  width,
  height
}) {

  const pose = getScenePose(sceneNumber, width, height);

  console.log(
    `🎭 Scene ${sceneNumber}: ${pose.name.toUpperCase()} pose`
  );

  const filter = buildCharacterFilter(
    sceneNumber,
    width,
    height
  );

  await execFileAsync("ffmpeg", [
    "-y",
    "-i", inputFile,
    "-vf", filter,
    "-frames:v", "1",
    outputFile
  ]);

  if (!fs.existsSync(outputFile)) {
    throw new Error(
      `Character visual failed for Scene ${sceneNumber}`
    );
  }

  return outputFile;
}

async function generateCharacterVisuals({
  visualFiles,
  projectId,
  width,
  height
}) {

  const results = [];

  for (let i = 0; i < visualFiles.length; i++) {

    const outputFile = path.join(
      IMAGE_DIR,
      `${projectId}-character-${i + 1}.png`
    );

    await addCharacters({
      inputFile: visualFiles[i],
      outputFile,
      sceneNumber: i + 1,
      width,
      height
    });

    results.push(outputFile);
  }

  return results;
}

module.exports = {
  addCharacters,
  generateCharacterVisuals,
  getScenePose
};
