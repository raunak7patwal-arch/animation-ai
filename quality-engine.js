const fs = require("fs");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

async function enhanceFinalVideo({
  inputFile,
  outputFile
}) {

  console.log("✨ V10: Applying final quality enhancement...");

  await execFileAsync("ffmpeg", [
    "-y",
    "-i", inputFile,

    "-vf",
    "eq=contrast=1.04:brightness=0.01:saturation=1.08,unsharp=5:5:0.4:5:5:0.0",

    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "21",
    "-pix_fmt", "yuv420p",

    "-c:a", "aac",
    "-b:a", "128k",

    outputFile
  ]);

  if (!fs.existsSync(outputFile)) {
    throw new Error("V10 quality enhancement failed");
  }

  console.log("✅ V10: Final quality enhancement completed");

  return outputFile;
}

module.exports = {
  enhanceFinalVideo
};
