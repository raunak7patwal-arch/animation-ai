const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const IMAGE_DIR = path.join(__dirname, "images");
fs.mkdirSync(IMAGE_DIR, { recursive: true });

function getCharacterLayout(sceneNumber, width, height) {
  const groundY = Math.floor(height * 0.78);

  const boyX =
    sceneNumber % 2 === 0
      ? Math.floor(width * 0.32)
      : Math.floor(width * 0.28);

  const robotX =
    sceneNumber % 2 === 0
      ? Math.floor(width * 0.68)
      : Math.floor(width * 0.72);

  const pose = sceneNumber % 7;

  return {
    groundY,
    boyX,
    robotX,
    pose
  };
}

function buildCharacterFilter(sceneNumber, width, height) {
  const { groundY, boyX, robotX } =
    getCharacterLayout(sceneNumber, width, height);

  const boyHeadY = groundY - 300;
  const robotY = groundY - 250;

  return [

    /* Ground */
    `drawbox=x=0:y=${groundY}:w=${width}:h=${height-groundY}:color=black@0.25:t=fill`,

    /* BOY - body */
    `drawbox=x=${boyX-65}:y=${groundY-220}:w=130:h=190:color=blue@0.9:t=fill`,

    /* Scene-specific arms / poses */
    sceneNumber % 3 === 1
      ? `drawbox=x=${boyX-115}:y=${groundY-200}:w=50:h=25:color=blue:t=fill`
      : sceneNumber % 3 === 2
      ? `drawbox=x=${boyX+65}:y=${groundY-250}:w=25:h=70:color=blue:t=fill`
      : `drawbox=x=${boyX-105}:y=${groundY-260}:w=25:h=70:color=blue:t=fill`,

    /* BOY - square cartoon head */
    `drawbox=x=${boyX-75}:y=${boyHeadY-75}:w=150:h=150:color=yellow@0.95:t=fill`,

    /* Hair */
    `drawbox=x=${boyX-75}:y=${boyHeadY-75}:w=150:h=25:color=black@0.9:t=fill`,

    /* Eyes */
    `drawbox=x=${boyX-45}:y=${boyHeadY-20}:w=22:h=22:color=black:t=fill`,
    `drawbox=x=${boyX+23}:y=${boyHeadY-20}:w=22:h=22:color=black:t=fill`,

    /* Smile */
    `drawbox=x=${boyX-35}:y=${boyHeadY+38}:w=70:h=12:color=red:t=fill`,

    /* Legs */
    `drawbox=x=${boyX-55}:y=${groundY-35}:w=35:h=35:color=blue:t=fill`,
    `drawbox=x=${boyX+20}:y=${groundY-35}:w=35:h=35:color=blue:t=fill`,

    /* ROBOT head */
    `drawbox=x=${robotX-90}:y=${robotY}:w=180:h=150:color=gray@0.95:t=fill`,

    /* ROBOT body */
    `drawbox=x=${robotX-110}:y=${robotY+150}:w=220:h=150:color=silver@0.95:t=fill`,

    /* Robot eyes */
    `drawbox=x=${robotX-55}:y=${robotY+50}:w=35:h=35:color=cyan:t=fill`,
    `drawbox=x=${robotX+20}:y=${robotY+50}:w=35:h=35:color=cyan:t=fill`,

    /* Robot mouth */
    sceneNumber % 2 === 0
      ? `drawbox=x=${robotX-45}:y=${robotY+110}:w=90:h=12:color=black:t=fill`
      : `drawbox=x=${robotX-35}:y=${robotY+100}:w=70:h=25:color=black:t=fill`,

    /* Antenna */
    `drawbox=x=${robotX-15}:y=${robotY-45}:w=30:h=45:color=gray:t=fill`,

    /* Antenna light - square instead of circle */
    `drawbox=x=${robotX-20}:y=${robotY-65}:w=40:h=20:color=red:t=fill`,

    /* Robot legs */
    `drawbox=x=${robotX-70}:y=${groundY-30}:w=40:h=30:color=gray:t=fill`,
    `drawbox=x=${robotX+30}:y=${groundY-30}:w=40:h=30:color=gray:t=fill`,

    /* Ground line */
    `drawbox=x=0:y=${groundY-3}:w=${width}:h=6:color=white@0.4:t=fill`

  ].join(",");
}

async function addCharacters({
  inputFile,
  outputFile,
  sceneNumber,
  width,
  height
}) {

  console.log(`🧍🤖 Adding characters to Scene ${sceneNumber}`);

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
  generateCharacterVisuals
};
