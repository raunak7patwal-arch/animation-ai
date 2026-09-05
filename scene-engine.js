function parseDuration(duration = "10 seconds") {
  if (typeof duration === "number") {
    return Math.max(1, duration);
  }

  const text = String(duration).toLowerCase();

  const min = text.match(/([\d.]+)\s*(minute|min|minutes)/);
  if (min) return Math.max(1, Number(min[1]) * 60);

  const sec = text.match(/([\d.]+)\s*(second|sec|seconds)/);
  if (sec) return Math.max(1, Number(sec[1]));

  const raw = Number(text.replace(/[^\d.]/g, ""));
  return Number.isFinite(raw) && raw > 0 ? raw : 10;
}

function createScenes({ prompt = "", duration = "10 seconds" } = {}) {
  const total = parseDuration(duration);

  const sceneCount =
    total <= 10 ? 3 :
    total <= 30 ? 5 :
    Math.min(12, Math.ceil(total / 6));

  const perScene = total / sceneCount;

  const scenes = [];

  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      number: i + 1,
      duration: Number(perScene.toFixed(2)),
      narration: String(prompt),
      visualPrompt:
        "Original cinematic animated scene, consistent fictional characters, polished cartoon composition.",
      characters: [],
      audio: {
        narration: true,
        music: false,
        sfx: false
      }
    });
  }

  console.log("====================================");
  console.log("🎭 JARVIS FREE STORY ENGINE");
  console.log("⏱️ Requested Duration:", duration);
  console.log("⏳ Total Seconds:", total);
  console.log("🎬 Scenes:", scenes.length);
  console.log("====================================");

  return scenes;
}

module.exports = {
  createScenes,
  parseDuration
};
