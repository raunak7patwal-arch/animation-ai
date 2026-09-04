const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);
const IMAGE_DIR = path.join(__dirname, "images");

fs.mkdirSync(IMAGE_DIR, { recursive: true });

function getCharacterLayout(sceneNumber, width, height) {
  const groundY = Math.floor(height * 0.78);

  const direction = sceneNumber % 2 === 0 ? 1 : -1;

  const boyX =
    Math.floor(width * 0.30) +
    direction * (sceneNumber % 3) * 25;

  const robotX =
    Math.floor(width * 0.70) -
    direction * (sceneNumber % 3) * 20;

  return {
    groundY,
    boyX,
    robotX,
    pose: ((sceneNumber - 1) % 7) + 1
  };
}

function buildCharacterFilter(sceneNumber, width, height) {
  const {
    groundY,
    boyX,
    robotX,
    pose
  } = getCharacterLayout(sceneNumber, width, height);

  const boyHeadY = groundY - 300;
  const robotY = groundY - 250;

  const filters = [

    /* Ground */
    `drawbox=x=0:y=${groundY}:w=${width}:h=${height-groundY}:color=black@0.25:t=fill`,

    /* ================= BOY BODY ================= */

    `drawbox=x=${boyX-65}:y=${groundY-220}:w=130:h=190:color=blue@0.9:t=fill`,

    /* Head */
    `drawbox=x=${boyX-75}:y=${boyHeadY-75}:w=150:h=150:color=yellow@0.95:t=fill`,

    /* Hair */
    `drawbox=x=${boyX-75}:y=${boyHeadY-75}:w=150:h=25:color=black@0.9:t=fill`,

    /* Eyes */
    `drawbox=x=${boyX-45}:y=${boyHeadY-20}:w=22:h=22:color=black:t=fill`,
    `drawbox=x=${boyX+23}:y=${boyHeadY-20}:w=22:h=22:color=black:t=fill`,

    /* Legs */
    `drawbox=x=${boyX-55}:y=${groundY-35}:w=35:h=35:color=blue:t=fill`,
    `drawbox=x=${boyX+20}:y=${groundY-35}:w=35:h=35:color=blue:t=fill`,

    /* ================= ROBOT ================= */

    /* Head */
    `drawbox=x=${robotX-90}:y=${robotY}:w=180:h=150:color=gray@0.95:t=fill`,

    /* Body */
    `drawbox=x=${robotX-110}:y=${robotY+150}:w=220:h=150:color=silver@0.95:t=fill`,

    /* Eyes */
    `drawbox=x=${robotX-55}:y=${robotY+50}:w=35:h=35:color=cyan:t=fill`,
    `drawbox=x=${robotX+20}:y=${robotY+50}:w=35:h=35:color=cyan:t=fill`,

    /* Antenna */
    `drawbox=x=${robotX-15}:y=${robotY-45}:w=30:h=45:color=gray:t=fill`,
    `drawbox=x=${robotX-20}:y=${robotY-65}:w=40:h=20:color=red:t=fill`,

    /* Robot legs */
    `drawbox=x=${robotX-70}:y=${groundY-30}:w=40:h=30:color=gray:t=fill`,
    `drawbox=x=${robotX+30}:y=${groundY-30}:w=40:h=30:color=gray:t=fill`
  ];

  /* ================= SCENE POSES ================= */

  if (pose === 1) {
    /* Happy */
    filters.push(
      `drawbox=x=${boyX-35}:y=${boyHeadY+38}:w=70:h=12:color=red:t=fill`,
      `drawbox=x=${robotX-45}:y=${robotY+110}:w=90:h=12:color=black:t=fill`
    );
  }

  if (pose === 2) {
    /* Shocked */
    filters.push(
      `drawbox=x=${boyX-25}:y=${boyHeadY+30}:w=50:h=32:color=black:t=fill`,
      `drawbox=x=${robotX-30}:y=${robotY+95}:w=60:h=38:color=red:t=fill`
    );
  }

  if (pose === 3) {
    /* Angry */
    filters.push(
      `drawbox=x=${boyX-50}:y=${boyHeadY-40}:w=40:h=10:color=black:t=fill`,
      `drawbox=x=${boyX+10}:y=${boyHeadY-40}:w=40:h=10:color=black:t=fill`,
      `drawbox=x=${boyX-30}:y=${boyHeadY+40}:w=60:h=10:color=red:t=fill`,
      `drawbox=x=${robotX-60}:y=${robotY+105}:w=120:h=18:color=black:t=fill`
    );
  }

  if (pose === 4) {
    /* Crazy funny */
    filters.push(
      `drawbox=x=${boyX-55}:y=${boyHeadY+25}:w=110:h=38:color=red:t=fill`,
      `drawbox=x=${robotX-70}:y=${robotY+100}:w=140:h=25:color=red:t=fill`
    );
  }

  if (pose === 5) {
    /* Laughing */
    filters.push(
      `drawbox=x=${boyX-45}:y=${boyHeadY+35}:w=90:h=22:color=black:t=fill`,
      `drawbox=x=${robotX-55}:y=${robotY+105}:w=110:h=22:color=black:t=fill`
    );
  }

  if (pose === 6) {
    /* Surprised */
    filters.push(
      `drawbox=x=${boyX-20}:y=${boyHeadY+28}:w=40:h=40:color=black:t=fill`,
      `drawbox=x=${robotX-25}:y=${robotY+95}:w=50:h=45:color=red:t=fill`
    );
  }

  if (pose === 7) {
    /* Final celebration */
    filters.push(
      `drawbox=x=${boyX-50}:y=${boyHeadY+35}:w=100:h=15:color=red:t=fill`,
      `drawbox=x=${robotX-65}:y=${robotY+105}:w=130:h=16:color=black:t=fill`
    );
  }

  /* Arms vary by scene */
  const armOffset = pose % 2 === 0 ? 45 : 10;

  filters.push(
    `drawbox=x=${boyX-115}:y=${groundY-190-armOffset}:w=50:h=20:color=yellow@0.95:t=fill`,
    `drawbox=x=${boyX+65}:y=${groundY-190+armOffset}:w=50:h=20:color=yellow@0.95:t=fill`,

    `drawbox=x=${robotX-150}:y=${robotY+170-armOffset}:w=40:h=25:color=gray:t=fill`,
    `drawbox=x=${robotX+110}:y=${robotY+170+armOffset}:w=40:h=25:color=gray:t=fill`,

    /* Ground line */
    `drawbox=x=0:y=${groundY-3}:w=${width}:h=6:color=white@0.4:t=fill`
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
  console.log(
    `🧍🤖 Adding character pose ${((sceneNumber - 1) % 7) + 1} to Scene ${sceneNumber}`
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
  generateCharacterVisuals
};
