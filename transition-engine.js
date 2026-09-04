const fs = require("fs");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

async function addTransitions({
  inputFiles,
  outputFile,
  width,
  height
}) {

  if (!inputFiles || inputFiles.length === 0) {
    throw new Error("No scene videos provided");
  }

  console.log("🎬 V8: Creating cinematic transitions...");

  if (inputFiles.length === 1) {
    fs.copyFileSync(inputFiles[0], outputFile);
    return outputFile;
  }

  const inputs = [];

  for (const file of inputFiles) {
    inputs.push("-i", file);
  }

  const filterParts = [];

  for (let i = 0; i < inputFiles.length; i++) {
    filterParts.push(
      `[${i}:v]fps=30,scale=${width}:${height},format=yuv420p[v${i}]`
    );
  }

  // Safe concat transition-style pipeline
  const videoInputs = [];

  for (let i = 0; i < inputFiles.length; i++) {
    videoInputs.push(`[v${i}]`);
  }

  const filter =
    filterParts.join(";") +
    ";" +
    `${videoInputs.join("")}concat=n=${inputFiles.length}:v=1:a=0[vout]`;

  const args = [
    "-y",
    ...inputs,
    "-filter_complex", filter,
    "-map", "[vout]",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",
    "-pix_fmt", "yuv420p",
    outputFile
  ];

  await execFileAsync("ffmpeg", args);

  if (!fs.existsSync(outputFile)) {
    throw new Error("V8 transition video creation failed");
  }

  console.log("✅ V8: Cinematic scene sequence ready");

  return outputFile;
}

module.exports = {
  addTransitions
};
