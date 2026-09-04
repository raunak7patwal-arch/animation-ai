const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const LAYER_DIR = path.join(__dirname, "layers");

fs.mkdirSync(LAYER_DIR, { recursive: true });


function getLayout(sceneNumber, width, height) {
  const groundY = Math.floor(height * 0.78);

  return {
    groundY,

    boyX:
      sceneNumber % 2 === 0
        ? Math.floor(width * 0.32)
        : Math.floor(width * 0.28),

    robotX:
      sceneNumber % 2 === 0
        ? Math.floor(width * 0.68)
        : Math.floor(width * 0.72)
  };
}


function buildBoyFilter(sceneNumber, width, height) {

  const { groundY, boyX } =
    getLayout(sceneNumber, width, height);

  const headY = groundY - 300;

  const poses = {
    1: { arm: 0, body: 0 },
    2: { arm: -40, body: -10 },
    3: { arm: 35, body: 5 },
    4: { arm: -55, body: -5 },
    5: { arm: 15, body: 0 },
    6: { arm: 45, body: -15 },
    7: { arm: -70, body: -20 }
  };

  const pose =
    poses[sceneNumber] || poses[1];

  return [

    // Transparent canvas
    `format=rgba`,

    // Body
    `drawbox=x=${boyX-65}:y=${groundY-220+pose.body}:w=130:h=190:color=blue@0.95:t=fill`,

    // Head
    `drawbox=x=${boyX-75}:y=${headY-75+pose.body}:w=150:h=150:color=yellow@0.98:t=fill`,

    // Hair
    `drawbox=x=${boyX-75}:y=${headY-75+pose.body}:w=150:h=25:color=black@0.95:t=fill`,

    // Eyes
    `drawbox=x=${boyX-45}:y=${headY-20+pose.body}:w=22:h=22:color=black:t=fill`,
    `drawbox=x=${boyX+23}:y=${headY-20+pose.body}:w=22:h=22:color=black:t=fill`,

    // Mouth
    `drawbox=x=${boyX-35}:y=${headY+38+pose.body}:w=70:h=12:color=red:t=fill`,

    // Arms
    `drawbox=x=${boyX-110}:y=${groundY-200+pose.arm}:w=45:h=110:color=blue@0.95:t=fill`,
    `drawbox=x=${boyX+65}:y=${groundY-200-pose.arm}:w=45:h=110:color=blue@0.95:t=fill`,

    // Legs
    `drawbox=x=${boyX-55}:y=${groundY-35}:w=35:h=35:color=blue:t=fill`,
    `drawbox=x=${boyX+20}:y=${groundY-35}:w=35:h=35:color=blue:t=fill`

  ].join(",");
}


function buildRobotFilter(sceneNumber, width, height) {

  const { groundY, robotX } =
    getLayout(sceneNumber, width, height);

  const robotY = groundY - 250;

  const reactions = {
    1: 0,
    2: -20,
    3: 20,
    4: -30,
    5: 5,
    6: -40,
    7: -25
  };

  const offset =
    reactions[sceneNumber] || 0;

  return [

    `format=rgba`,

    // Head
    `drawbox=x=${robotX-90}:y=${robotY+offset}:w=180:h=150:color=gray@0.98:t=fill`,

    // Body
    `drawbox=x=${robotX-110}:y=${robotY+150+offset}:w=220:h=150:color=silver@0.98:t=fill`,

    // Eyes
    `drawbox=x=${robotX-55}:y=${robotY+50+offset}:w=35:h=35:color=cyan:t=fill`,
    `drawbox=x=${robotX+20}:y=${robotY+50+offset}:w=35:h=35:color=cyan:t=fill`,

    // Mouth
    `drawbox=x=${robotX-45}:y=${robotY+110+offset}:w=90:h=12:color=black:t=fill`,

    // Antenna
    `drawbox=x=${robotX-15}:y=${robotY-45+offset}:w=30:h=45:color=gray:t=fill`,

    // Light
    `drawbox=x=${robotX-20}:y=${robotY-65+offset}:w=40:h=20:color=red:t=fill`,

    // Legs
    `drawbox=x=${robotX-70}:y=${groundY-30}:w=40:h=30:color=gray:t=fill`,
    `drawbox=x=${robotX+30}:y=${groundY-30}:w=40:h=30:color=gray:t=fill`

  ].join(",");
}


async function createLayers({
  backgroundFile,
  projectId,
  sceneNumber,
  width,
  height
}) {

  const boyFile = path.join(
    LAYER_DIR,
    `${projectId}-boy-${sceneNumber}.png`
  );

  const robotFile = path.join(
    LAYER_DIR,
    `${projectId}-robot-${sceneNumber}.png`
  );


  console.log(
    `🧍 Creating boy layer for Scene ${sceneNumber}`
  );

  /*
   Create transparent boy layer
  */

  await execFileAsync("ffmpeg", [
    "-y",

    "-f", "lavfi",
    "-i", `color=color=black@0.0:size=${width}x${height}:rate=1`,

    "-vf", buildBoyFilter(
      sceneNumber,
      width,
      height
    ),

    "-frames:v", "1",

    "-pix_fmt", "rgba",

    boyFile
  ]);


  console.log(
    `🤖 Creating robot layer for Scene ${sceneNumber}`
  );

  /*
   Create transparent robot layer
  */

  await execFileAsync("ffmpeg", [
    "-y",

    "-f", "lavfi",
    "-i", `color=color=black@0.0:size=${width}x${height}:rate=1`,

    "-vf", buildRobotFilter(
      sceneNumber,
      width,
      height
    ),

    "-frames:v", "1",

    "-pix_fmt", "rgba",

    robotFile
  ]);


  if (
    !fs.existsSync(boyFile) ||
    !fs.existsSync(robotFile)
  ) {

    throw new Error(
      `Layer creation failed for Scene ${sceneNumber}`
    );

  }


  return {
    backgroundFile,
    boyFile,
    robotFile
  };
}


module.exports = {
  createLayers
};
