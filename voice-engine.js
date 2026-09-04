const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const AUDIO_DIR = path.join(__dirname, "audio");
fs.mkdirSync(AUDIO_DIR, { recursive: true });

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getVoiceSettings(character) {
  const voices = {
    narrator: {
      speed: 145,
      pitch: 50
    },
    funnyMale: {
      speed: 165,
      pitch: 55
    },
    funnyFemale: {
      speed: 175,
      pitch: 70
    }
  };

  return voices[character] || voices.narrator;
}

async function generateVoice({
  text,
  fileName,
  character = "narrator"
}) {

  const settings = getVoiceSettings(character);

  const outputFile = path.join(
    AUDIO_DIR,
    fileName
  );

  const clean = cleanText(text);

  if (!clean) {
    throw new Error("Voice text is empty");
  }

  console.log("🎙️ Generating voice:", fileName);

  await execFileAsync("espeak", [
    "-s", String(settings.speed),
    "-p", String(settings.pitch),
    "-w", outputFile,
    clean
  ]);

  if (!fs.existsSync(outputFile)) {
    throw new Error("Voice file was not created");
  }

  return outputFile;
}

async function generateSceneVoices({
  scenes,
  projectId
}) {

  const audioFiles = [];

  for (let i = 0; i < scenes.length; i++) {

    const scene = scenes[i];

    const character =
      i % 3 === 0
        ? "funnyMale"
        : i % 3 === 1
          ? "funnyFemale"
          : "narrator";

    const text =
      scene.text ||
      scene.description ||
      `Scene ${i + 1}`;

    const file = await generateVoice({
      text,
      fileName: `${projectId}-scene-${i + 1}.wav`,
      character
    });

    audioFiles.push(file);
  }

  return audioFiles;
}

module.exports = {
  generateVoice,
  generateSceneVoices
};
